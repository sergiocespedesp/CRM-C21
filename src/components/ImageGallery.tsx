import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
    images: string[];
    propertyName?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, propertyName }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const openLightbox = (index: number) => {
        setSelectedIndex(index);
    };

    const closeLightbox = () => {
        setSelectedIndex(null);
    };

    const goToPrevious = () => {
        if (selectedIndex !== null) {
            setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
        }
    };

    const goToNext = () => {
        if (selectedIndex !== null) {
            setSelectedIndex((selectedIndex + 1) % images.length);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (selectedIndex === null) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
    };

    React.useEffect(() => {
        if (selectedIndex !== null) {
            window.addEventListener('keydown', handleKeyDown as any);
            return () => window.removeEventListener('keydown', handleKeyDown as any);
        }
    }, [selectedIndex]);

    if (!images || images.length === 0) {
        return (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
                <p className="text-gray-500">No hay imágenes disponibles</p>
            </div>
        );
    }

    return (
        <>
            {/* Thumbnail Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => openLightbox(index)}
                        className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity group"
                    >
                        <img
                            src={image}
                            alt={`${propertyName || 'Propiedad'} - Imagen ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full transition-opacity">
                                Ver imagen
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
                        aria-label="Cerrar"
                    >
                        <X size={32} />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
                        {selectedIndex + 1} / {images.length}
                    </div>

                    {/* Previous Button */}
                    {images.length > 1 && (
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 text-white hover:text-gray-300 transition-colors"
                            aria-label="Imagen anterior"
                        >
                            <ChevronLeft size={48} />
                        </button>
                    )}

                    {/* Image */}
                    <div
                        className="max-w-7xl max-h-[90vh] mx-4 cursor-pointer"
                        onClick={closeLightbox}
                    >
                        <img
                            src={images[selectedIndex]}
                            alt={`${propertyName || 'Propiedad'} - Imagen ${selectedIndex + 1}`}
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                    </div>

                    {/* Next Button */}
                    {images.length > 1 && (
                        <button
                            onClick={goToNext}
                            className="absolute right-4 text-white hover:text-gray-300 transition-colors"
                            aria-label="Imagen siguiente"
                        >
                            <ChevronRight size={48} />
                        </button>
                    )}

                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 -z-10"
                        onClick={closeLightbox}
                    />
                </div>
            )}
        </>
    );
};

export default ImageGallery;
