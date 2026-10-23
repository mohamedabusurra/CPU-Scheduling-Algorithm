import { useEffect, useRef, useState, type FormEvent } from "react";
import {
    MAX_FRAMES, MAX_REFERENCES, SAMPLE_REFERENCE, parseReferenceString, simulateClock,
} from "../../shared/clock";

function ClockIcon({ className = "" }: { className?: string }) {
    return <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>;
}

const algorithms = [
    { name: "FIFO", fullName: "First In, First Out", description: "Replace the page that has been in memory the longest." },
    { name: "LRU", fullName: "Least Recently Used", description: "Replace the page that has gone the longest without being used." },
    { name: "MRU", fullName: "Most Recently Used", description: "Replace the page that was used most recently." },
    { name: "LFU", fullName: "Least Frequently Used", description: "Replace the page with the fewest recorded accesses." },
    { name: "MFU", fullName: "Most Frequently Used", description: "Replace the page with the most recorded accesses." },
    { name: "Optimal", fullName: "Optimal Page Replacement", description: "Replace the page whose next use is farthest in the future." },
    { name: "Clock", fullName: "Second Chance", description: "Follow the clock hand and give recently used pages a second chance." },
];

export default function App() {
    const [showClock, setShowClock] = useState(() => window.location.hash === "#/clock");

    useEffect(() => {
        const navigate = () => {
            setShowClock(window.location.hash === "#/clock");
            window.scrollTo(0, 0);
        };
        window.addEventListener("hashchange", navigate);
        return () => window.removeEventListener("hashchange", navigate);
    }, []);

    useEffect(() => {
        document.title = showClock ? "Clock · Memory Lab" : "Algorithms · Memory Lab";
    }, [showClock]);

    return <>
        <header className="site-header">
            <div className="header-inner">
                <a className="brand" href="#/" aria-label="Memory Lab home"><span className="brand-icon"><ClockIcon /></span>Memory<span className="brand-light">Lab</span></a>
                <span className="header-divider" />
                <span className="header-caption">Operating systems, made visible.</span>
                <span className="lab-tag"><span />Interactive lab</span>
            </div>
        </header>
        {showClock ? <ClockSimulator /> : <main className="home-page">
            <section className="intro home-intro" aria-labelledby="page-title">
                <div className="eyebrow"><span className="eyebrow-line" />THE ALGORITHM COLLECTION</div>
                <h1 id="page-title">A place for every page.<br /><span>Explore the algorithms.</span></h1>
                <p>Discover how each page-replacement policy decides what stays in memory.<br className="desktop-break" /> Start with an algorithm below.</p>
            </section>
            <section aria-labelledby="algorithms-title">
                <div className="collection-heading"><h2 id="algorithms-title">Page replacement algorithms</h2><span>07 algorithms</span></div>
                <div className="algorithm-grid">
                    {algorithms.map((algorithm, index) => {
                        const content = <>
                            <div className="algorithm-card-top"><span className="algorithm-number">{String(index + 1).padStart(2, "0")}</span>{algorithm.name === "Clock" && <span className="available-tag">Interactive</span>}</div>
                            <h3>{algorithm.name}</h3>
                            <p className="algorithm-full-name">{algorithm.fullName}</p>
                            <p className="algorithm-description">{algorithm.description}</p>
                            <div className="algorithm-card-footer">{algorithm.name === "Clock" ? <>Open simulator <span aria-hidden="true">↗</span></> : <span>Simulator coming soon</span>}</div>
                        </>;
                        return algorithm.name === "Clock"
                            ? <a key={algorithm.name} className="algorithm-card interactive-card" href="#/clock">{content}</a>
                            : <article key={algorithm.name} className="algorithm-card">{content}</article>;
                    })}
                </div>
            </section>
            <footer><span>MEMORY LAB <span className="footer-slash">/</span> ALGORITHM COLLECTION</span><span>Built for the curious.</span></footer>
        </main>}
    </>;
}

function ClockSimulator() {
    const [reference, setReference] = useState(SAMPLE_REFERENCE);
    const [frameCount, setFrameCount] = useState("4");
    const [result, setResult] = useState(() => simulateClock(parseReferenceString(SAMPLE_REFERENCE)));
    const [selected, setSelected] = useState(0);
    const [error, setError] = useState("");
    const [errorField, setErrorField] = useState<"references" | "frames">("references");
    const [submitted, setSubmitted] = useState({ reference: SAMPLE_REFERENCE, frameCount: "4" });
    const referenceInput = useRef<HTMLInputElement>(null);
    const grid = useRef<HTMLDivElement>(null);
    const step = result.steps[selected];
    const edited = reference !== submitted.reference || frameCount !== submitted.frameCount;
    const hitRate = Math.round(result.page_hits / result.pages.length * 100);

    function runSimulation(event: FormEvent) {
        event.preventDefault();
        let validatingField: "references" | "frames" = "references";
        try {
            const pages = parseReferenceString(reference);
            validatingField = "frames";
            const next = simulateClock(pages, Number(frameCount));
            setResult(next);
            setSelected(0);
            setSubmitted({ reference, frameCount });
            setError("");
            grid.current?.scrollTo({ left: 0 });
        } catch (caught) {
            setErrorField(validatingField);
            setError(caught instanceof Error ? caught.message : "Check your input and try again.");
        }
    }

    function loadExample() {
        setReference(SAMPLE_REFERENCE);
        setFrameCount("4");
        setError("");
        referenceInput.current?.focus();
    }

    function selectStep(index: number) {
        setSelected(index);
        const column = grid.current?.querySelector<HTMLElement>(`[data-step="${index}"]`);
        if (column && grid.current) {
            const container = grid.current;
            const cellBounds = column.getBoundingClientRect();
            const gridBounds = container.getBoundingClientRect();
            if (cellBounds.right > gridBounds.right || cellBounds.left < gridBounds.left + 105) {
                container.scrollLeft += cellBounds.left - gridBounds.left - 110;
            }
        }
    }

    return <>
        <main>
            <a className="back-link" href="#/">← All algorithms</a>
            <section className="intro" aria-labelledby="page-title">
                <div className="eyebrow"><span className="eyebrow-line" />PAGE REPLACEMENT / 01</div>
                <h1 id="page-title">Clock page replacement.<br /><span>A second chance, visualized.</span></h1>
                <p>Explore the <strong>Clock algorithm</strong>. Follow the hand, watch reference bits change,<br className="desktop-break" /> and see exactly when a page stays—or makes room.</p>
                <div className="intro-clock" aria-hidden="true"><ClockIcon /><span>CLOCK</span></div>
            </section>

            <section className="panel input-panel" aria-labelledby="input-title">
                <div className="panel-heading"><span className="section-number">01</span><h2 id="input-title">Set up your simulation</h2><span className="muted panel-note">Your input. Every step explained.</span></div>
                <form onSubmit={runSimulation} noValidate>
                    <div className="form-row">
                        <div className="reference-field">
                            <label htmlFor="references">Reference string</label>
                            <input ref={referenceInput} id="references" value={reference} onChange={(event) => setReference(event.target.value)}
                                placeholder="e.g. 7 0 1 2 0 3 0 4" autoComplete="off" spellCheck={false}
                                aria-describedby={error && errorField === "references" ? "input-help form-error" : "input-help"} aria-invalid={Boolean(error) && errorField === "references"} />
                        </div>
                        <div className="frames-field">
                            <label htmlFor="frames">Memory frames</label>
                            <input id="frames" type="number" min="1" max={MAX_FRAMES} step="1" value={frameCount}
                                onChange={(event) => setFrameCount(event.target.value)} aria-describedby={error && errorField === "frames" ? "frame-help form-error" : "frame-help"} aria-invalid={Boolean(error) && errorField === "frames"} />
                        </div>
                        <button className="button primary" type="submit"><span aria-hidden="true">▷</span>Run simulation<span aria-hidden="true">↗</span></button>
                    </div>
                    <div className="form-meta"><p id="input-help">Separate pages with spaces or commas, or type a continuous string. <span id="frame-help">1–{MAX_FRAMES} frames · up to {MAX_REFERENCES} pages.</span></p><button className="text-button" type="button" onClick={loadExample}>↻ Load example</button></div>
                    {error && <p id="form-error" className="form-error" role="alert">{error}</p>}
                </form>
            </section>

            <section className="results" aria-labelledby="results-title">
                <div className="results-heading"><h2 id="results-title">Simulation results</h2><p className={edited ? "pending-note" : "run-note"}>{edited ? "Inputs changed · run to update results" : `${result.pages.length} ${result.pages.length === 1 ? "reference" : "references"} processed · ${result.frame_count} ${result.frame_count === 1 ? "frame" : "frames"}`}</p></div>
                <div className="metrics" aria-live="polite" aria-atomic="true">
                    <article className="metric"><div className="metric-label"><span className="metric-icon fault-icon">↗</span>Page faults</div><div className="metric-value">{result.page_faults}<span>page loads</span></div><div className="metric-bar"><span style={{ width: `${100 - hitRate}%` }} /></div></article>
                    <article className="metric"><div className="metric-label"><span className="metric-icon hit-icon">✓</span>Page hits</div><div className="metric-value">{result.page_hits}<span>already in memory</span></div><div className="metric-bar green"><span style={{ width: `${hitRate}%` }} /></div></article>
                    <article className="metric"><div className="metric-label"><span className="metric-icon rate-icon">◎</span>Hit rate</div><div className="metric-value">{hitRate}<span className="percent">%</span></div><p className="metric-foot">{result.page_hits} of {result.pages.length} references found in memory</p></article>
                </div>

                <div className="panel grid-panel">
                    <div className="panel-heading grid-heading"><span className="section-number">02</span><h3>Memory over time</h3><div className="legend"><span><i className="fault-dot" />Page fault</span><span><i className="hit-dot" />Page hit</span></div></div>
                    <div className="grid-description">Each column is a page request. Select a step to look inside the clock.</div>
                    <div className="table-scroll" ref={grid} tabIndex={0} role="region" aria-label="Scrollable memory results grid">
                        <table>
                            <caption className="sr-only">Clock page replacement: frame contents and reference bits after each request</caption>
                            <thead><tr><th scope="col" className="row-label">Reference<span>STEP →</span></th>
                                {result.steps.map((item, index) => <th key={index} scope="col" className={index === selected ? "selected-column" : ""}>
                                    <button type="button" data-step={index} className="step-button" aria-label={`Step ${index + 1}: page ${item.page}, ${item.hit ? "hit" : "fault"}`} aria-pressed={index === selected} onClick={() => selectStep(index)}><span className="step-index">{String(index + 1).padStart(2, "0")}</span><span className="page-token" title={item.page}>{item.page}</span></button>
                                </th>)}
                            </tr></thead>
                            <tbody>{Array.from({ length: result.frame_count }, (_, frame) => <tr key={frame}>
                                <th scope="row" className="row-label">Frame <span className="frame-index">{String(frame + 1).padStart(2, "0")}</span></th>
                                {result.steps.map((item, index) => <td key={index} className={index === selected ? "selected-column" : ""}>
                                    <div className={`frame-cell ${item.frame_index === frame ? item.hit ? "hit-cell" : "fault-cell" : ""}`} title={`Frame ${frame + 1}: ${item.frames[frame] ?? "empty"}, reference bit ${item.reference_bits[frame]}`}>
                                        <span className={item.frames[frame] === null ? "empty-value" : ""}>{item.frames[frame] ?? "—"}</span>
                                        {item.frames[frame] !== null && <sup aria-label={`reference bit ${item.reference_bits[frame]}`}>{item.reference_bits[frame]}</sup>}
                                    </div>
                                </td>)}
                            </tr>)}</tbody>
                            <tfoot><tr><th scope="row" className="row-label">Outcome</th>{result.steps.map((item, index) => <td key={index} className={index === selected ? "selected-column" : ""}><span className={`outcome ${item.hit ? "hit" : "fault"}`} aria-label={item.hit ? "Page hit" : "Page fault"}>{item.hit ? "H" : "F"}</span></td>)}</tr></tfoot>
                        </table>
                    </div>
                    <div className="grid-foot"><span><sup>1</sup> / <sup>0</sup> Small numbers show reference bits</span><span>Scroll horizontally for longer sequences <span aria-hidden="true">↔</span></span></div>
                </div>

                <div className="step-panel" aria-labelledby="step-title">
                    <div className="step-detail" aria-live="polite">
                        <div className="step-kicker"><ClockIcon /><span>INSIDE THE CLOCK</span><span className={`status ${step.hit ? "hit" : "fault"}`}>{step.hit ? "Page hit" : "Page fault"}</span></div>
                        <h3 id="step-title">Step {selected + 1}: requesting <span className="inline-page">{step.page}</span></h3>
                        <p>{step.hit
                            ? `Page ${step.page} is already in frame ${step.frame_index + 1}. Its reference bit is set to 1, and the clock hand stays in place.`
                            : `${step.cleared_frames.length ? `The hand clears ${step.cleared_frames.length} reference ${step.cleared_frames.length === 1 ? "bit" : "bits"}, giving those pages a second chance. ` : ""}${step.evicted_page === null ? `Page ${step.page} fills empty frame ${step.frame_index + 1}.` : `Page ${step.page} replaces ${step.evicted_page} in frame ${step.frame_index + 1}.`} The hand moves to frame ${step.next_hand + 1}.`}</p>
                    </div>
                    <div className="step-controls"><span className="step-counter">{String(selected + 1).padStart(2, "0")} <span>/ {String(result.steps.length).padStart(2, "0")}</span></span><button className="arrow-button" aria-label="Previous step" disabled={selected === 0} onClick={() => selectStep(selected - 1)}>←</button><button className="arrow-button" aria-label="Next step" disabled={selected === result.steps.length - 1} onClick={() => selectStep(selected + 1)}>→</button></div>
                </div>
            </section>
            <aside className="explanation"><span className="info-icon">i</span><p><strong>Why “second chance”?</strong> A reference bit of 1 gives a page another turn. The clock clears that bit and moves on, replacing the first page it finds with a bit of 0.</p></aside>
            <footer><span>MEMORY LAB <span className="footer-slash">/</span> CLOCK ALGORITHM</span><span>Built for the curious.</span></footer>
        </main>
    </>;
}
