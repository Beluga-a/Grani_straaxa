import Link from "next/link";
import { QUESTS } from "@/data";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
      <div className={styles.top}>
        <div>
          <div className={styles.logo}>
            <span className={styles.dot} />
            ГРАНИ СТРАХА
          </div>
          <p className={styles.desc}>
            Экстремальные хоррор-квесты с 2017 года. Живые актёры,
            профессиональные декорации, незабываемые впечатления. 18+.
          </p>
        </div>
        <div>
          <div className={styles.head}>Навигация</div>
          <ul className={styles.links}>
            {[
              ["Главная страница", "/", "Главная"],
              ["Квесты", "/quests"],
              ["Галерея", "/gallery"],
              ["Отзывы", "/reviews"],
              ["О нас", "/about"],
              ["Контакты", "/contacts"],
              ["FAQ", "/faq"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href as string}>{label as string}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className={styles.head}>Квесты</div>
          <ul className={styles.links}>
            {QUESTS.slice(0, 5).map((q) => (
              <li key={q.id}>
                <Link href={`/quests#${q.id}`}>{q.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className={styles.head}>Контакты</div>
          <ul className={styles.links}>
            <li>
              <span>ул. Бабушкина, 66</span>
            </li>
            <li>
              <span>8 999 420 31 41</span>
            </li>
            <li>
              <span>granistraha526@gmail.com</span>
            </li>
            <li>
              <span>Пн–Вс 10:00–23:00</span>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.copy}>
          © 2026 ГРАНИ СТРАХА. Все права защищены.
        </div>
        <div className={styles.social}>
          {["VK", "TG", "IG", "YT"].map((s) => (
            <a key={s} href="#" className={styles.socialBtn}>
              {s}
            </a>
          ))}
        </div>
      </div>
      </div>
    </footer>
  );
}
