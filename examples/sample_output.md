# Sample Output

This is an example of the structured JSON output that Paper2Prototype generates after analyzing a paper. This corresponds to the [sample input](sample_input.md).

---

```json
{
  "title": "EfficientSeg: Lightweight Semantic Segmentation via Adaptive Feature Fusion",

  "mainProblem": "Existing semantic segmentation models (DeepLabV3+, SegFormer) are too computationally expensive for real-time inference on edge and mobile devices. There is a need for a model that maintains competitive accuracy while being lightweight enough to run at high frame rates on constrained hardware.",

  "simpleSummary": "EfficientSeg is a lightweight semantic segmentation model that uses a MobileNetV3-Small backbone and a novel Adaptive Feature Fusion (AFF) module. The AFF module dynamically combines multi-scale features using learned attention weights instead of simple concatenation, which reduces computation while preserving accuracy. The model achieves 76.3 mIoU on Cityscapes with only 2.1M parameters.",

  "keyContribution": "The Adaptive Feature Fusion (AFF) module — a channel-attention-based mechanism that replaces static multi-scale feature concatenation with a learned weighted combination, adding only 0.3 GFLOPs while improving mIoU by 2.8 points over simple concatenation.",

  "modelArchitecture": "1. Backbone: MobileNetV3-Small, extracting feature maps from stages 3, 4, and 5 at resolutions 1/8, 1/16, and 1/32.\n2. AFF Module: (a) Project all three feature maps to C=128 channels via 1x1 conv. (b) Upsample smaller maps to 1/8 resolution via bilinear interpolation. (c) Compute channel attention per scale using GAP → MLP (reduction ratio r=4). (d) Softmax-normalize attention across scales. (e) Output = weighted sum of projected features.\n3. Segmentation Head: Two 3x3 depthwise separable convolutions → BN → ReLU → 1x1 conv for class logits → bilinear upsample to input resolution.",

  "datasetRequirements": "Cityscapes: 2,975 training / 500 validation images, 19 semantic classes, 1024x2048 resolution. Download from cityscapes-dataset.com (requires registration). ADE20K: 20,210 training / 2,000 validation images, 150 classes. Available via MIT Scene Parsing benchmark.",

  "preprocessingSteps": "1. Random crop to 768x768 during training.\n2. Random horizontal flip.\n3. Random scaling with factor between 0.5 and 2.0.\n4. Color jitter (specific parameters not specified in paper).\n5. Standard ImageNet normalization (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]) — assumed based on MobileNetV3 backbone.",

  "trainingProcedure": "Optimizer: AdamW with initial learning rate 0.001 and weight decay 0.01. Schedule: Cosine annealing over 120 epochs. Batch size: 16. The paper does not specify GPU count, gradient accumulation, or warmup period.",

  "lossFunction": "Cross-entropy loss with Online Hard Example Mining (OHEM). OHEM keeps only the top 25% hardest pixels (highest loss) per batch for gradient computation, forcing the model to focus on difficult regions.",

  "evaluationMetrics": "1. Mean Intersection over Union (mIoU) — primary accuracy metric.\n2. FPS — measured on NVIDIA Jetson Xavier NX with TensorRT FP16 optimization.\n3. Parameter count (M) and GFLOPs for efficiency comparison.",

  "implementationChecklist": [
    "Set up project with PyTorch and torchvision",
    "Download and prepare Cityscapes dataset (register, download, organize into train/val splits)",
    "Implement data loading with random crop (768x768), horizontal flip, random scaling (0.5-2.0), and color jitter",
    "Load pretrained MobileNetV3-Small backbone and extract feature maps from stages 3, 4, 5",
    "Implement the AFF module: 1x1 projections, bilinear upsampling, GAP+MLP attention, softmax weighting",
    "Implement segmentation head: two depthwise separable convs + 1x1 classifier + bilinear upsample",
    "Implement OHEM cross-entropy loss (keep top 25% hardest pixels)",
    "Set up AdamW optimizer with lr=0.001, weight_decay=0.01, cosine annealing schedule",
    "Train for 120 epochs with batch size 16",
    "Evaluate on Cityscapes val set using mIoU",
    "Benchmark inference speed on target hardware",
    "Run ablation: compare AFF vs simple concatenation, with/without OHEM"
  ],

  "starterCode": "import torch\nimport torch.nn as nn\nimport torch.nn.functional as F\nfrom torchvision.models import mobilenet_v3_small\n\n\nclass AFFModule(nn.Module):\n    \"\"\"Adaptive Feature Fusion module.\"\"\"\n    def __init__(self, in_channels_list, out_channels=128, reduction=4):\n        super().__init__()\n        self.projections = nn.ModuleList([\n            nn.Conv2d(c, out_channels, 1) for c in in_channels_list\n        ])\n        mid = out_channels // reduction\n        self.attentions = nn.ModuleList([\n            nn.Sequential(\n                nn.AdaptiveAvgPool2d(1),\n                nn.Flatten(),\n                nn.Linear(out_channels, mid),\n                nn.ReLU(inplace=True),\n                nn.Linear(mid, out_channels),\n            )\n            for _ in in_channels_list\n        ])\n\n    def forward(self, features):\n        target_size = features[0].shape[2:]  # largest resolution\n        projected = [\n            F.interpolate(proj(f), size=target_size, mode='bilinear', align_corners=False)\n            for proj, f in zip(self.projections, features)\n        ]\n        attn_weights = torch.stack(\n            [attn(p) for attn, p in zip(self.attentions, projected)], dim=0\n        )\n        attn_weights = F.softmax(attn_weights, dim=0)\n        stacked = torch.stack(projected, dim=0)\n        fused = (stacked * attn_weights.unsqueeze(-1).unsqueeze(-1)).sum(dim=0)\n        return fused\n\n\nclass EfficientSeg(nn.Module):\n    def __init__(self, num_classes=19):\n        super().__init__()\n        backbone = mobilenet_v3_small(pretrained=True)\n        self.features = backbone.features\n        # TODO: Extract intermediate feature maps from stages 3, 4, 5\n        # Channel counts depend on MobileNetV3-Small architecture\n        self.aff = AFFModule(in_channels_list=[24, 48, 96], out_channels=128)\n        self.head = nn.Sequential(\n            # Depthwise separable conv\n            nn.Conv2d(128, 128, 3, padding=1, groups=128),\n            nn.BatchNorm2d(128),\n            nn.ReLU(inplace=True),\n            nn.Conv2d(128, 128, 1),\n            # Second depthwise separable conv\n            nn.Conv2d(128, 128, 3, padding=1, groups=128),\n            nn.BatchNorm2d(128),\n            nn.ReLU(inplace=True),\n            nn.Conv2d(128, num_classes, 1),\n        )\n\n    def forward(self, x):\n        input_size = x.shape[2:]\n        # TODO: Run backbone and collect multi-scale features\n        # features = [stage3_out, stage4_out, stage5_out]\n        # fused = self.aff(features)\n        # logits = self.head(fused)\n        # return F.interpolate(logits, size=input_size, mode='bilinear', align_corners=False)\n        pass\n",

  "missingDetails": [
    "Color jitter parameters (brightness, contrast, saturation, hue ranges) are not specified",
    "Number of GPUs and whether gradient accumulation is used are not mentioned",
    "Learning rate warmup period (if any) is not described",
    "ImageNet normalization is assumed but not explicitly stated in the paper",
    "Exact MobileNetV3-Small stage indices for feature extraction are not precisely defined",
    "Inference optimization details (TensorRT conversion steps) are not provided",
    "Random seed or reproducibility setup is not discussed"
  ],

  "difficultyScore": "Medium",

  "reasonForDifficulty": "The model architecture is relatively straightforward (backbone + attention module + segmentation head) and uses a standard pre-trained backbone. However, correctly extracting intermediate features from MobileNetV3, implementing OHEM, and reproducing the exact AFF attention mechanism require careful engineering. Several missing details (color jitter params, GPU setup, exact stage indices) will require experimentation to fill in."
}
```

## How This Maps to the Dashboard

| JSON Key | Dashboard Tab | Card Title |
|----------|---------------|------------|
| `title` | Header | Paper title |
| `difficultyScore` | Header | Difficulty badge |
| `mainProblem` | Overview | Research Problem |
| `simpleSummary` | Overview | Simple Summary |
| `keyContribution` | Overview | Key Contribution |
| `implementationChecklist` | Overview | Implementation Checklist |
| `reasonForDifficulty` | Overview | Difficulty Reasoning |
| `modelArchitecture` | Architecture | Model Architecture |
| `datasetRequirements` | Dataset | Dataset Requirements |
| `preprocessingSteps` | Dataset | Preprocessing Steps |
| `trainingProcedure` | Training | Training Procedure |
| `lossFunction` | Training | Loss Function |
| `evaluationMetrics` | Training | Evaluation Metrics |
| `starterCode` | Code | PyTorch Starter Code |
| `missingDetails` | Missing Details | Missing or Unclear Details |
