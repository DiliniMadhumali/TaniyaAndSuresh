export default function PhotoFrame({ photo, className = '', aspect = 'aspect-[4/5]' }) {
  return (
    <figure className={`group min-w-0 ${className}`}>
      <div className={`relative overflow-hidden ${aspect}`}>
        {photo.src ? (
          <img
            src={photo.src}
            alt={photo.alt}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-olive/10 px-4 text-center transition duration-500 group-hover:bg-gold/15">
            <span className="font-script text-4xl text-burgundy sm:text-5xl">T & S</span>
            <span className="mt-4 max-w-[12rem] text-[0.62rem] uppercase leading-relaxed tracking-[0.24em] text-brown/70">
              Photograph to follow
            </span>
          </div>
        )}
      </div>
      {photo.caption ? (
        <figcaption className="mt-3 text-center font-serif text-lg italic text-brown/75">
          {photo.caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
