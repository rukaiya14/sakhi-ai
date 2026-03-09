"""
Prepare Dataset for SageMaker Training
Organizes images from dataset folder into train/val split
"""

import os
import shutil
from pathlib import Path
import random

def prepare_dataset(source_dir='../dataset images', output_dir='../dataset-prepared', val_split=0.2):
    """
    Prepare dataset for training
    
    Args:
        source_dir: Source dataset folder
        output_dir: Output folder for prepared dataset
        val_split: Validation split ratio (0.2 = 20%)
    """
    
    print("=" * 60)
    print("Preparing Dataset for SageMaker Training")
    print("=" * 60)
    
    # Create output directories
    train_dir = Path(output_dir) / 'train'
    val_dir = Path(output_dir) / 'val'
    
    # Categories to process
    categories = ['embroidery', 'cooking', 'henna', 'crochet', 'tailoring', 'crafts']
    skill_levels = ['beginner', 'intermediate', 'advanced']
    
    total_images = 0
    train_images = 0
    val_images = 0
    
    for category in categories:
        print(f"\n📁 Processing category: {category}")
        
        for skill_level in skill_levels:
            source_path = Path(source_dir) / category / skill_level
            
            if not source_path.exists():
                print(f"   ⚠️  Skipping {category}/{skill_level} (not found)")
                continue
            
            # Get all images
            images = list(source_path.glob('*.jpg')) + \
                    list(source_path.glob('*.jpeg')) + \
                    list(source_path.glob('*.png'))
            
            if len(images) == 0:
                print(f"   ⚠️  No images in {category}/{skill_level}")
                continue
            
            # Shuffle images
            random.shuffle(images)
            
            # Split into train/val
            split_idx = int(len(images) * (1 - val_split))
            train_imgs = images[:split_idx]
            val_imgs = images[split_idx:]
            
            # Create directories
            train_dest = train_dir / category / skill_level
            val_dest = val_dir / category / skill_level
            train_dest.mkdir(parents=True, exist_ok=True)
            val_dest.mkdir(parents=True, exist_ok=True)
            
            # Copy train images
            for img in train_imgs:
                shutil.copy2(img, train_dest / img.name)
            
            # Copy val images
            for img in val_imgs:
                shutil.copy2(img, val_dest / img.name)
            
            total_images += len(images)
            train_images += len(train_imgs)
            val_images += len(val_imgs)
            
            print(f"   ✅ {category}/{skill_level}: {len(train_imgs)} train, {len(val_imgs)} val")
    
    print("\n" + "=" * 60)
    print("Dataset Preparation Complete!")
    print("=" * 60)
    print(f"\nTotal Images: {total_images}")
    print(f"Training Images: {train_images} ({train_images/total_images*100:.1f}%)")
    print(f"Validation Images: {val_images} ({val_images/total_images*100:.1f}%)")
    print(f"\nOutput Directory: {output_dir}")
    print(f"  Train: {train_dir}")
    print(f"  Val: {val_dir}")
    
    # Show structure
    print("\n📊 Dataset Structure:")
    for split in ['train', 'val']:
        split_dir = Path(output_dir) / split
        for category in categories:
            cat_dir = split_dir / category
            if cat_dir.exists():
                for skill_level in skill_levels:
                    skill_dir = cat_dir / skill_level
                    if skill_dir.exists():
                        count = len(list(skill_dir.glob('*')))
                        if count > 0:
                            print(f"  {split}/{category}/{skill_level}: {count} images")
    
    print("\n✅ Ready for SageMaker training!")
    print("\nNext step: Run deploy_sagemaker.py")

if __name__ == '__main__':
    # Set random seed for reproducibility
    random.seed(42)
    
    prepare_dataset()
