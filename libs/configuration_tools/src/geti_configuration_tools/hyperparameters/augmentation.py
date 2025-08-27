# Copyright (C) 2022-2025 Intel Corporation
# LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

from pydantic import Field

from .base_model_no_extra import BaseModelNoExtra


class RandomResizeCrop(BaseModelNoExtra):
    enable: bool = Field(
        default=False,
        title="Enable random resize crop",
        description="Whether to apply random resize and crop to the image. "
        "Note: this augmentation is not supported when Tiling algorithm is enabled.",
    )
    # Exclude fields as they are supported yet by OTX
    crop_ratio_range: tuple[float, float] | None = Field(
        default=None,
        title="Crop resize ratio range",
        description="Ratio of original dimensions to apply during resize crop operation",
        exclude=True,
    )
    aspect_ratio_range: tuple[float, float] | None = Field(
        default=None,
        title="Aspect ratio range",
        description="Range of aspect ratios to apply during resize crop operation",
    )


class RandomAffine(BaseModelNoExtra):
    enable: bool = Field(
        default=False,
        title="Enable random affine",
        description="Whether to apply random affine transformations to the image",
    )
    # Exclude fields as they are supported yet by OTX
    max_rotate_degree: float | None = Field(
        ge=0.0,
        default=10.0,
        title="Rotation degrees",
        description="Maximum rotation angle in degrees",
    )
    max_translate_ratio: float | None = Field(
        default=0.1,
        ge=0.0,
        lt=1.0,
        title="Horizontal translation",
        description="Maximum horizontal translation as a fraction of image width",
    )
    scaling_ratio_range: tuple[float, float] | None = Field(
        default=(0.5, 1.5),
        title="Scaling ratio range",
        description=(
            "Range (min, max) of scaling factors to apply during affine transformation. "
            "Both values should be > 0.0 and < 1.0. "
            "For example, (0.8, 1.2) will randomly scale the image between 80% and 120% of its original size."
        ),
    )
    max_shear_degree: float | None = Field(
        default=2.0,
        title="Maximum shear degree",
        description="Maximum absolute shear angle in degrees to apply during affine transformation",
    )


class RandomHorizontalFlip(BaseModelNoExtra):
    enable: bool = Field(
        default=False,
        title="Enable random horizontal flip",
        description="Whether to apply random flip images horizontally along the vertical axis (swap left and right)",
    )
    prob: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        title="Probability",
        description="Probability of applying horizontal flip",
    )


class RandomVerticalFlip(BaseModelNoExtra):
    enable: bool = Field(
        default=False,
        title="Enable random vertical flip",
        description="Whether to apply random flip images vertically along the horizontal axis (swap top and bottom)",
    )
    prob: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        title="Probability",
        description="Probability of applying vertical flip",
    )


class RandomIOUCrop(BaseModelNoExtra):
    enable: bool = Field(
        default=False,
        title="Enable random IoU crop",
        description="Whether to apply random cropping based on IoU criteria. "
        "Note: this augmentation is not supported when Tiling algorithm is enabled.",
    )


class TopdownAffine(BaseModelNoExtra):
    enable: bool = Field(
        default=True,
        title="Enable topdown affine",
        description="Whether to apply topdown affine transformations for keypoint detection",
    )
    affine_transforms_prob: float = Field(
        default=1.0,
        ge=0.0,
        le=1.0,
        title="Affine transforms probability",
        description="Probability of applying affine transformations",
    )


class GaussianBlur(BaseModelNoExtra):
    enable: bool = Field(
        default=False,
        title="Enable Gaussian blur",
        description="Whether to apply Gaussian blur to the image",
    )
    kernel_size: int = Field(
        gt=0,
        default=5,
        title="Kernel size",
        description="Size of the Gaussian kernel",
    )
    sigma: tuple[float, float] = Field(
        default=(0.1, 2.0),
        title="Sigma range",
        description="Range of sigma values for Gaussian blur",
    )
    prob: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        title="Probability",
        description="Probability of applying Gaussian blur",
    )


class ColorJitter(BaseModelNoExtra):
    enable: bool = Field(
        default=False,
        title="Enable color jitter",
        description="Whether to apply random color jitter to the image",
    )
    brightness: tuple[float, float] = Field(
        default=(0.875, 1.125),
        title="Brightness range",
        description="Range of brightness adjustment factors",
    )
    contrast: tuple[float, float] = Field(
        default=(0.5, 1.5),
        title="Contrast range",
        description="Range of contrast adjustment factors",
    )
    saturation: tuple[float, float] = Field(
        default=(0.5, 1.5),
        title="Saturation range",
        description="Range of saturation adjustment factors",
    )
    hue: tuple[float, float] = Field(
        default=(-0.05, 0.05),
        title="Hue range",
        description="Range of hue adjustment values",
    )
    p: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        title="Probability",
        description="Probability of applying color jitter",
    )


class GaussianNoise(BaseModelNoExtra):
    enable: bool = Field(
        default=False,
        title="Enable Gaussian noise",
        description="Whether to apply Gaussian noise to the image",
    )
    mean: float = Field(
        default=0.0,
        title="Mean",
        description="Mean of the Gaussian noise",
    )
    sigma: float = Field(
        default=0.1,
        ge=0.0,
        title="Standard deviation",
        description="Standard deviation of the Gaussian noise",
    )
    prob: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        title="Probability",
        description="Probability of applying Gaussian noise",
    )


class PhotometricDistort(BaseModelNoExtra):
    enable: bool = Field(
        default=True,
        title="Enable photometric distort",
        description="Whether to apply photometric distortion to the image",
    )
    brightness_delta: int = Field(
        default=32,
        ge=0,
        title="Brightness delta",
        description="Maximum delta for brightness adjustment",
    )
    contrast: tuple[float, float] = Field(
        default=(0.5, 1.5),
        title="Contrast range",
        description="Range of contrast adjustment factors",
    )
    saturation: tuple[float, float] = Field(
        default=(0.5, 1.5),
        title="Saturation range",
        description="Range of saturation adjustment factors",
    )
    hue_delta: int = Field(
        default=18,
        title="Hue delta",
        description="Maximum delta for hue adjustment",
    )
    p: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        title="Probability",
        description="Probability of applying photometric distortion",
    )


class Tiling(BaseModelNoExtra):
    enable: bool = Field(
        default=False,
        title="Enable tiling",
        description="Whether to apply tiling to the image",
    )
    adaptive_tiling: bool = Field(
        default=False, title="Adaptive tiling", description="Whether to use adaptive tiling based on image content"
    )
    tile_size: int = Field(
        gt=0,
        default=128,
        title="Tile size",
        description=(
            "Size of each tile in pixels. "
            "Decreasing the tile size typically results in higher accuracy, "
            "but it is also more computationally expensive due to the higher number of tiles. "
            "In any case, the tile must be large enough to capture the entire object and its surrounding context, "
            "so choose a value larger than the size of most annotations."
        ),
    )
    tile_overlap: float = Field(
        ge=0.0,
        lt=1.0,
        default=0.5,
        title="Tile overlap",
        description="Overlap between adjacent tiles as a fraction of tile size",
    )


class Mosaic(BaseModelNoExtra):
    enable: bool = Field(
        default=True,
        title="Enable mosaic",
        description="Whether to apply mosaic augmentation (combines 4 images into one)",
    )


class Mixup(BaseModelNoExtra):
    enable: bool = Field(
        default=True,
        title="Enable mixup",
        description="Whether to apply mixup augmentation (blends two images and their labels)",
    )
    prob: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        title="Probability",
        description="Probability of applying mixup augmentation",
    )


class HSVRandomAug(BaseModelNoExtra):
    enable: bool = Field(
        default=True,
        title="Enable HSV random augmentation",
        description="Whether to apply random HSV (Hue, Saturation, Value) augmentation",
    )
    hue_delta: int = Field(
        default=5,
        ge=0,
        title="Hue delta",
        description="Maximum delta for hue adjustment",
    )
    saturation_delta: int = Field(
        default=30,
        ge=0,
        title="Saturation delta",
        description="Maximum delta for saturation adjustment",
    )
    value_delta: int = Field(
        default=30,
        ge=0,
        title="Value delta",
        description="Maximum delta for value (brightness) adjustment",
    )


class AugmentationParameters(BaseModelNoExtra):
    """Configuration parameters for data augmentation during training."""

    topdown_affine: TopdownAffine | None = Field(
        default=None, title="Topdown affine", description="Settings for topdown affine transformations"
    )
    iou_random_crop: RandomIOUCrop | None = Field(
        default=None,
        title="IoU random crop",
        description="Randomly crop images based on Intersection over Union (IoU) criteria",
    )
    mosaic: Mosaic | None = Field(
        default=None, title="Mosaic", description="Settings for mosaic augmentation"
    )
    random_resize_crop: RandomResizeCrop | None = Field(
        default=None, title="Random resize crop", description="Settings for random resize and crop augmentation"
    )
    random_affine: RandomAffine | None = Field(
        default=None, title="Random affine", description="Settings for random affine transformations"
    )
    mixup: Mixup | None = Field(
        default=None, title="Mixup", description="Settings for mixup augmentation"
    )
    hsv_random_aug: HSVRandomAug | None = Field(
        default=None, title="HSV random augmentation", description="Settings for HSV random augmentation"
    )
    random_horizontal_flip: RandomHorizontalFlip | None = Field(
        default=None,
        title="Random horizontal flip",
        description="Randomly flip images horizontally along the vertical axis (swap left and right)",
    )
    random_vertical_flip: RandomVerticalFlip | None = Field(
        default=None,
        title="Random vertical flip",
        description="Randomly flip images vertically along the horizontal axis (swap top and bottom)",
    )
    color_jitter: ColorJitter | None = Field(
        default=None,
        title="Color jitter",
        description="Settings for random color jitter (brightness, contrast, saturation, hue)",
    )
    gaussian_blur: GaussianBlur | None = Field(
        default=None, title="Gaussian blur", description="Settings for Gaussian blur augmentation"
    )
    photometric_distort: PhotometricDistort | None = Field(
        default=None, title="Photometric distort", description="Settings for photometric distortion augmentation"
    )
    gaussian_noise: GaussianNoise | None = Field(
        default=None, title="Gaussian noise", description="Settings for Gaussian noise augmentation"
    )
    tiling: Tiling | None = Field(default=None, title="Tiling", description="Settings for image tiling")
