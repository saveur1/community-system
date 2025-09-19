import React from 'react'

type OptimizedImageProps = {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  style?: React.CSSProperties
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  style,
}) => {
  if (process.env.NODE_ENV === 'development') {
    if (!src || !alt || !width || !height) {
      console.warn('OptimizedImage: src, alt, width, and height are all required.')
    }
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      className={className}
      style={style}
    />
  )
}

export default OptimizedImage
