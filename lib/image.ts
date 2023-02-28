export function getImageSrc(image: File | string) {
  if (typeof image === "string") {
    return image;
  }

  return URL.createObjectURL(image);
}
