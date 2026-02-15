import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Other Projects | UK Parliament Bill Analyser",
    description: "Other projects by the creator of the UK Parliament Bill Analyser.",
};

const projects = [
    { name: "Bertie", url: "https://www.bertieapp.com" },
    { name: "Logos — Substack", url: "https://logos.substack.com" },
    { name: "Cellar Door", url: "https://www.cellar-door.co.uk" },
];

export default function ProjectsPage() {
    return (
        <div className="content-container">
            <h1>Other Projects</h1>
            <p>Some other things I've built or write at:</p>
            <ul>
                {projects.map((project) => (
                    <li key={project.name}>
                        <a href={project.url} target="_blank" rel="noopener noreferrer">
                            {project.name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
