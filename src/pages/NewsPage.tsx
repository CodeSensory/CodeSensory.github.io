import { labNews } from '../content/news'
import { PageHeading } from '../components/layout/PageHeading'
import { SECTION_SHELL } from '../components/layout/sectionShell'

export function NewsPage() {
  return (
    <>
      <PageHeading title="소식" lead="논문 채택, 투고, 원고 진행을 시간 순으로 적습니다." />
      <div className={`${SECTION_SHELL} pt-0`}>
        <ul className="divide-y divide-zinc-200 border-t border-zinc-200">
          {labNews.map((item) => (
            <li key={item.id} className="py-8">
              <p className="text-sm text-zinc-500">
                {item.date} · {item.category}
              </p>
              <h2 className="mt-2 text-xl font-medium">{item.title}</h2>
              <p className="mt-3 max-w-[65ch] leading-relaxed text-zinc-600">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
