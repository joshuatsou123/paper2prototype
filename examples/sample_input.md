# Sample Input

This is an example of the type of paper text that Paper2Prototype processes after PDF extraction. The text below is a simplified, fictional abstract and method section written in the style of a real AI/ML paper. It is not from any actual published paper.

---

## Example Paper: "EfficientSeg: Lightweight Semantic Segmentation via Adaptive Feature Fusion"

### Abstract

We propose EfficientSeg, a lightweight semantic segmentation model designed for real-time inference on edge devices. Our approach introduces an Adaptive Feature Fusion (AFF) module that dynamically combines multi-scale features using learned attention weights, reducing computational cost by 40% compared to existing methods while maintaining competitive accuracy. We evaluate on Cityscapes and ADE20K, achieving 76.3 mIoU on Cityscapes val with only 2.1M parameters and 28 GFLOPs. Our method runs at 62 FPS on an NVIDIA Jetson Xavier NX.

### 1. Introduction

Semantic segmentation assigns a class label to every pixel in an image. While recent models like DeepLabV3+ and SegFormer achieve strong accuracy, they require significant computation, making them impractical for deployment on mobile and edge devices. We address this gap by designing a model that is both accurate and efficient.

### 2. Method

#### 2.1 Backbone

We use MobileNetV3-Small as our feature extractor, taking feature maps from stages 3, 4, and 5 at resolutions 1/8, 1/16, and 1/32 of the input.

#### 2.2 Adaptive Feature Fusion Module

The AFF module takes three feature maps of different scales as input. Each is projected to a common channel dimension C=128 using 1x1 convolutions. The smaller maps are upsampled via bilinear interpolation to match the largest resolution. A channel attention vector is computed for each scale using global average pooling followed by a two-layer MLP (reduction ratio r=4). The attention vectors are normalized via softmax across scales, and the output is the weighted sum of the three projected feature maps.

#### 2.3 Segmentation Head

The fused feature map passes through two 3x3 depthwise separable convolutions, batch normalization, and ReLU, followed by a 1x1 convolution to produce per-pixel class logits. The output is bilinearly upsampled to the original input resolution.

### 3. Training

We train for 120 epochs using AdamW optimizer with initial learning rate 0.001, weight decay 0.01, and cosine annealing schedule. Batch size is 16. Input images are randomly cropped to 768x768 during training. Data augmentation includes random horizontal flip, random scaling (0.5–2.0), and color jitter. The loss function is cross-entropy with online hard example mining (OHEM), keeping the top 25% hardest pixels.

### 4. Experiments

#### Datasets
- **Cityscapes**: 2,975 training / 500 validation images, 19 classes, 1024x2048 resolution
- **ADE20K**: 20,210 training / 2,000 validation images, 150 classes

#### Results
| Model | Params | GFLOPs | mIoU (Cityscapes) |
|-------|--------|--------|-------------------|
| BiSeNetV2 | 3.4M | 21.2 | 72.6 |
| STDC2 | 12.3M | 17.2 | 74.2 |
| EfficientSeg (ours) | 2.1M | 28.0 | 76.3 |

#### Evaluation Metrics
- Mean Intersection over Union (mIoU)
- FPS measured on NVIDIA Jetson Xavier NX with TensorRT FP16

### 5. Ablation

Removing the AFF module and using simple concatenation drops mIoU by 2.8 points. Removing OHEM drops mIoU by 1.2 points. The attention mechanism adds only 0.3 GFLOPs overhead.
