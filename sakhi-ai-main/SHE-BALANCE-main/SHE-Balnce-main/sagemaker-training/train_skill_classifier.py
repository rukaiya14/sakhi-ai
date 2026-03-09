"""
SageMaker Training Script for Skill Classification
Trains a CNN model to classify artisan skill levels
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np
import json
import os
import argparse

# Skill levels
SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced']
NUM_CLASSES = len(SKILL_LEVELS)

def create_model(input_shape=(224, 224, 3)):
    """
    Create CNN model for skill classification
    Uses transfer learning with MobileNetV2
    """
    
    # Load pre-trained MobileNetV2
    base_model = keras.applications.MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base model
    base_model.trainable = False
    
    # Build model
    model = keras.Sequential([
        # Input layer
        layers.Input(shape=input_shape),
        
        # Preprocessing
        layers.Rescaling(1./255),
        
        # Base model
        base_model,
        
        # Custom layers
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.3),
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        layers.Dense(128, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.2),
        
        # Output layer
        layers.Dense(NUM_CLASSES, activation='softmax')
    ])
    
    return model

def load_dataset(data_dir):
    """
    Load and preprocess dataset
    Expected structure:
    data_dir/
        embroidery/
            beginner/
            intermediate/
            advanced/
        cooking/
            beginner/
            intermediate/
            advanced/
    """
    
    # Use Keras image_dataset_from_directory
    dataset = keras.preprocessing.image_dataset_from_directory(
        data_dir,
        labels='inferred',
        label_mode='categorical',
        class_names=SKILL_LEVELS,
        batch_size=32,
        image_size=(224, 224),
        shuffle=True,
        seed=42
    )
    
    return dataset

def train_model(train_dir, val_dir, output_dir, hyperparameters):
    """
    Train the skill classification model
    """
    
    print("Loading datasets...")
    train_dataset = load_dataset(train_dir)
    val_dataset = load_dataset(val_dir)
    
    # Optimize dataset performance
    AUTOTUNE = tf.data.AUTOTUNE
    train_dataset = train_dataset.cache().prefetch(buffer_size=AUTOTUNE)
    val_dataset = val_dataset.cache().prefetch(buffer_size=AUTOTUNE)
    
    print("Creating model...")
    model = create_model()
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=hyperparameters['learning_rate']),
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=2, name='top_2_accuracy')]
    )
    
    print("Model summary:")
    model.summary()
    
    # Callbacks
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7
        ),
        keras.callbacks.ModelCheckpoint(
            os.path.join(output_dir, 'best_model.h5'),
            monitor='val_accuracy',
            save_best_only=True
        )
    ]
    
    print("Training model...")
    history = model.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=hyperparameters['epochs'],
        callbacks=callbacks,
        verbose=1
    )
    
    # Fine-tune model (unfreeze some layers)
    print("Fine-tuning model...")
    base_model = model.layers[2]
    base_model.trainable = True
    
    # Freeze all layers except last 20
    for layer in base_model.layers[:-20]:
        layer.trainable = False
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=hyperparameters['learning_rate'] / 10),
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=2, name='top_2_accuracy')]
    )
    
    # Continue training
    history_fine = model.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=20,
        callbacks=callbacks,
        verbose=1
    )
    
    # Save final model
    print("Saving model...")
    model.save(os.path.join(output_dir, 'skill_classifier_model'))
    
    # Save training history
    history_dict = {
        'initial_training': {
            'accuracy': [float(x) for x in history.history['accuracy']],
            'val_accuracy': [float(x) for x in history.history['val_accuracy']],
            'loss': [float(x) for x in history.history['loss']],
            'val_loss': [float(x) for x in history.history['val_loss']]
        },
        'fine_tuning': {
            'accuracy': [float(x) for x in history_fine.history['accuracy']],
            'val_accuracy': [float(x) for x in history_fine.history['val_accuracy']],
            'loss': [float(x) for x in history_fine.history['loss']],
            'val_loss': [float(x) for x in history_fine.history['val_loss']]
        }
    }
    
    with open(os.path.join(output_dir, 'training_history.json'), 'w') as f:
        json.dump(history_dict, f, indent=2)
    
    # Evaluate on validation set
    print("Evaluating model...")
    results = model.evaluate(val_dataset)
    
    evaluation = {
        'val_loss': float(results[0]),
        'val_accuracy': float(results[1]),
        'val_top_2_accuracy': float(results[2])
    }
    
    with open(os.path.join(output_dir, 'evaluation.json'), 'w') as f:
        json.dump(evaluation, f, indent=2)
    
    print(f"Training complete! Final validation accuracy: {evaluation['val_accuracy']:.4f}")
    
    return model

def main():
    """
    Main training function
    """
    
    parser = argparse.ArgumentParser()
    
    # Hyperparameters
    parser.add_argument('--epochs', type=int, default=50)
    parser.add_argument('--batch_size', type=int, default=32)
    parser.add_argument('--learning_rate', type=float, default=0.001)
    
    # SageMaker specific arguments
    parser.add_argument('--model-dir', type=str, default=os.environ.get('SM_MODEL_DIR', './model'))
    parser.add_argument('--train', type=str, default=os.environ.get('SM_CHANNEL_TRAINING', './data/train'))
    parser.add_argument('--validation', type=str, default=os.environ.get('SM_CHANNEL_VALIDATION', './data/val'))
    
    args = parser.parse_args()
    
    hyperparameters = {
        'epochs': args.epochs,
        'batch_size': args.batch_size,
        'learning_rate': args.learning_rate
    }
    
    # Train model
    model = train_model(
        train_dir=args.train,
        val_dir=args.validation,
        output_dir=args.model_dir,
        hyperparameters=hyperparameters
    )
    
    print("Training job completed successfully!")

if __name__ == '__main__':
    main()
