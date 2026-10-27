import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Phone, Star, Zap, Lightbulb, Plug, Camera, ShieldAlert, Wrench, Home, Building2, Clock, BadgeCheck, MapPin, ArrowRight } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { jobsQuery } from "@/lib/jobs";
import { JobCard } from "@/components/JobCard";
import { QuoteForm } from "@/components/QuoteForm";

function RecentWork() {
  const { data } = useQuery(jobsQuery(3));
  if (!data?.length) return null;
  return (
    <section id="work" className="mx-auto max-w-6xl px-5 py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-primary">Our work</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-display text-4xl sm:text-5xl">Recent jobs.</h2>
        <Link to="/work" className="inline-flex items-center gap-1 font-semibold">See all <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((j) => <JobCard key={j.id} job={j} />)}
      </div>
    </section>
  );
}

const TITLE = "K A K Electricals | 24/7 Electrician Craigieburn";
const DESC = "A-Grade licensed electrician in Craigieburn, VIC. Lighting, powerpoints, CCTV, alarms and 24/7 emergency repairs. Rated 5.0 from 200+ Google reviews.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: Index,
});

const PHONE = "0425 170 200";
const TEL = "tel:+61425170200";

const services = [
  { icon: ShieldAlert, t: "24/7 Emergency", d: "Power outages, faults and urgent repairs — day or night." },
  { icon: Lightbulb, t: "Lighting & Downlights", d: "Chandeliers, pendants, pillar lights and LED downlights." },
  { icon: Plug, t: "Powerpoints", d: "New outlets, upgrades and relocations, done safely." },
  { icon: Wrench, t: "Fault Finding", d: "Troubleshooting and electrical repairs to get you powered." },
  { icon: Camera, t: "CCTV Cameras", d: "Security camera installation for homes and businesses." },
  { icon: Zap, t: "Security Alarms", d: "Alarm system supply, install and maintenance." },
  { icon: Home, t: "New Homes", d: "Pre-move-in electrical works and full fit-offs." },
  { icon: Building2, t: "Commercial", d: "Installations and ongoing maintenance for businesses." },
];

const reviews = [
  { n: "Rashida B.", q: "Installed my bedroom ceiling light perfectly and even went the extra mile getting into the manhole above the insulation. Very reasonable pricing, extremely professional." },
  { n: "Thomas T.", q: "Fantastic experience with before-moving-in electrical works. You can trust him 100% — professional, careful work without any damage." },
  { n: "Thomas C.", q: "We installed our chandelier, pillar lights and pendant lights. Quality of work was excellent. Pricing was transparent and fair." },
  { n: "G S.", q: "Thanks for installing beautiful lights in my new house. Very helpful and worked around my needs. Will call again soon!" },
  { n: "Pitty V.", q: "Extremely impressed with the fast, high-quality and reliable service. They arrived promptly and got it done." },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-primary">
      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="#" className="text-display text-lg"><span className="text-primary">KAK</span> Electricals</a>
          <a href={TEL} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Phone className="h-4 w-4" /> <span className="hidden sm:inline">{PHONE}</span><span className="sm:hidden">Call</span>
          </a>
        </div>
      </header>

      <section className="relative flex min-h-[92svh] items-end overflow-hidden">
        <img src={hero} alt="Modern home lit by warm pendant lights" width={1280} height={1600} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-28">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/60 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Available 24/7 · Craigieburn & surrounds
          </div>
          <h1 className="text-display max-w-3xl text-5xl leading-[0.95] sm:text-7xl">
            Power you can <span className="text-primary">trust.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            A-Grade licensed electrician for homes and businesses. Careful work, fair pricing, and we answer when the lights go out.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={TEL} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 font-semibold text-primary-foreground shadow-glow">
              <Phone className="h-5 w-5" /> Call {PHONE}
            </a>
            <Link to="/work" className="inline-flex items-center justify-center rounded-full border border-border bg-background/70 px-7 py-4 font-semibold">See recent jobs</Link>
          </div>
          <div className="mt-10 flex items-center gap-3">
            <Stars />
            <p className="text-sm"><b>5.0</b> <span className="text-muted-foreground">from 200+ Google reviews</span></p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-border px-2 py-6 text-center">
          {[{ i: Clock, t: "24/7", s: "Emergency" }, { i: BadgeCheck, t: "A-Grade", s: "REC 21381" }, { i: Star, t: "5.0★", s: "Rated" }].map(({ i: I, t, s }) => (
            <div key={t} className="px-2">
              <I className="mx-auto mb-1 h-5 w-5 text-primary" />
              <div className="text-display text-lg sm:text-2xl">{t}</div>
              <div className="text-xs text-muted-foreground">{s}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">What we do</p>
        <h2 className="text-display mt-2 text-4xl sm:text-5xl">All kinds of electrical work.</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: I, t, d }) => (
            <div key={t} className="group rounded-xl border border-border bg-card p-6 transition hover:border-primary/60 hover:shadow-glow">
              <div className="mb-4 inline-flex rounded-lg bg-secondary p-3 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <I className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card py-20">
        <div className="mx-auto max-w-6xl px-5">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Reviews</p>
          <h2 className="text-display mt-2 text-4xl sm:text-5xl">Locals say it best.</h2>
          <div className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
            {reviews.map((r) => (
              <figure key={r.n} className="w-[85%] shrink-0 snap-center rounded-xl border border-border bg-background p-6 md:w-auto">
                <Stars />
                <blockquote className="mt-4 text-foreground/90">“{r.q}”</blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-muted-foreground">— {r.n}, Google</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <RecentWork />

      <section id="quote" className="bg-card py-20">
        <div className="mx-auto max-w-3xl px-5">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">Free quote</p>
          <h2 className="text-display mt-2 text-4xl sm:text-5xl">Tell us about your job.</h2>
          <p className="mt-3 text-muted-foreground">Leave your details and we'll get back to you with a quote.</p>
          <div className="mt-8"><QuoteForm /></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h2 className="text-display text-4xl sm:text-6xl">Lights out? <span className="text-primary">Call now.</span></h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">Fast response across Craigieburn, Roxburgh Park, Mickleham and Melbourne's north.</p>
        <a href={TEL} className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-glow">
          <Phone className="h-5 w-5" /> {PHONE}
        </a>
      </section>

      <footer className="border-t border-border pb-24 pt-8 sm:pb-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> 10 Northcroft St, Craigieburn VIC 3064</span>
          <span>© {new Date().getFullYear()} K A K Electricals · REC 21381</span>
        </div>
      </footer>

      <a href={TEL} className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-center gap-2 rounded-full bg-primary py-4 font-semibold text-primary-foreground shadow-glow sm:hidden">
        <Phone className="h-5 w-5" /> Call 24/7 — {PHONE}
      </a>
    </div>
  );
}
