import { photos } from '../../data/weddingData.js'
import PhotoFrame from '../common/PhotoFrame.jsx'
import Reveal from '../common/Reveal.jsx'
import SectionHeading from '../common/SectionHeading.jsx'

export default function GallerySection() {
  const [featured, ...rest] = photos

  return (
    <section id="gallery" className="scroll-mt-20 bg-ivory px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <SectionHeading eyebrow="Gallery" title="Our Story">
          Photographs of Taniya and Suresh will be placed here.
        </SectionHeading>
      </Reveal>

      <div className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-12 md:gap-7">
        <PhotoFrame photo={featured} className="md:col-span-7" aspect="aspect-[4/5]" />
        <div className="grid gap-6 md:col-span-5">
          {rest.map((photo) => (
            <PhotoFrame key={photo.id} photo={photo} aspect="aspect-[4/3]" />
          ))}
        </div>
      </div>
    </section>
  )
}
