import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white py-4">
      <div className="container mx-auto px-4 flex flex-col items-center">
        <nav>
          <ul className="flex flex-wrap justify-center gap-2 md:gap-8 text-[#064c3b] font-light text-xs md:text-sm">
            <li>
              <Link href="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-of-use" className="hover:underline">
                Terms of Use
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
