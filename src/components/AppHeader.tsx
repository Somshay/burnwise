import CompletedLink from "./CompletedLink";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export default function AppHeader() {
  return (
    <header className="topbar glass">
      <div className="brand" aria-label="BurnWise">
        <Logo />
        <span>BurnWise</span>
        <small className="muted" style={{ fontWeight: 500, fontSize: "0.85rem" }}>อ.ปาย จ.แม่ฮ่องสอน</small>
      </div>
      <div className="spacer" style={{ flex: 1 }} />
      <CompletedLink />
      <ThemeToggle />
    </header>
  );
}
