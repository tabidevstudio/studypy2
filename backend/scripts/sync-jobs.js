const mongoose = require("mongoose");
const fetch = require("node-fetch");
const path = require("path");
require("dotenv").config({path: path.join(__dirname, "../.env") });

const Job = require("../models/Job");
const COUNTRIES_TO_SYNC = ["Philippines"];

function analyzeJobMetaData(title, snippet) {
    const titleLower = title.toLowerCase();
    const seniorKeywords = ["senior", "sr.", "lead", "principal", "staff", "manager", "director", "head of", "architect", "vp ", "vice president", "c-level", "cto", "ceo", "coo", "vp"];
    if (seniorKeywords.some(kw => titleLower.includes(kw))) {
        return { techTags: ["Developer"], workMode: "onsite", experienceLevel: "any" };
    }

    const text = `${title} ${snippet || ""}`.toLowerCase();
    const techTags = [];
    let workMode = "onsite";

    if(text.includes("python")) techTags.push("Python");

    if(text.includes("javascript") || text.includes("js") || text.includes("typescript") || text.includes("ts") || text.includes("node")) {
        techTags.push("Javascript");
    }

    if (text.includes("sql") || text.includes("database") || text.includes("mongodb") ||
        text.includes("mysql") || text.includes("postgres")) {
        techTags.push("SQL");
    }

    if (text.includes("html") || text.includes("css") || text.includes("frontend") ||
        text.includes("web developer") || text.includes("react") || text.includes("vue")) {
        techTags.push("HTML & CSS");
    }

    if (text.includes("java ") || text.includes("spring boot") || text.includes("spring-boot")) {
        techTags.push("Java");
    }

    if (text.includes("c++") || text.includes("c#") || text.includes(".net") || text.includes("dotnet")) {
        techTags.push("C / C++");
    }

    if (text.includes("php") || text.includes("laravel")) {
        techTags.push("PHP");
    }

    if (text.includes("git ") || text.includes("github") || text.includes("devops") || text.includes("docker")) {
        techTags.push("Git");
    }

    if(techTags.length === 0){
        techTags.push("Developer");
    }

    if(text.includes("remote") || text.includes("work from home") || text.includes("wfh") || text.includes("anywhere")){
        workMode = "remote";
    } else if(text.includes("hybrid")){
        workMode = "hybrid";
    }

    let experienceLevel = "any";

    if (text.includes("intern") || text.includes("ojt") || text.includes("trainee") ||
        text.includes("on-the-job") || text.includes("practicum")) {
        experienceLevel = "internship";
    } else if (text.includes("entry level") || text.includes("entry-level") ||
        text.includes("fresh grad") || text.includes("junior") ||
        text.includes("graduate") || text.includes("no experience") ||
        text.includes("new grad") || text.includes("0-1 year") || text.includes("0 to 1")) {
        experienceLevel = "entry-level";
    }

    return { techTags, workMode, experienceLevel };
}


const jobSources = [
    {
        name: "Jooble",
        enabled: !!process.env.JOOBLE_API_KEY,
        fetchJobs: async (country) => {
            const apiKey = process.env.JOOBLE_API_KEY;
            const queries = [
                "junior developer intern Philippines",
                "fresh graduate software engineer Philippines"
            ];

            let allJobs = [];

            for (const keywords of queries) {
                console.log(` Fetching from Jooble API [${keywords}]...`);
                const response = await fetch(`https://jooble.org/api/${apiKey}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        keywords,
                        location: country,
                        page: "1"
                    })
                });

                if (!response.ok) {
                    console.error(`Jooble query failed: ${response.status}`);
                    continue;
                }

                const data = await response.json();
                const rawJobs = (data.jobs || []).filter(job =>
                    job.link && job.link.trim() !== "" &&
                    job.company && job.company.trim() !== ""
                );

                const mapped = rawJobs.map(job => {
                    const { techTags, workMode, experienceLevel } = analyzeJobMetaData(job.title, job.snippet);
                    return {
                        title: job.title,
                        company: job.company,
                        location: job.location,
                        description: job.snippet,
                        applyLink: job.link,
                        salary: job.salary,
                        source: "Jooble",
                        postedAt: job.updated ? new Date(job.updated) : new Date(),
                        techTags,
                        workMode,
                        experienceLevel
                    };
                }).filter(job => job.experienceLevel !== "any");

                allJobs = allJobs.concat(mapped);
            }

            // deduplicate by applyLink
            const seen = new Set();
            return allJobs.filter(job => {
                if (seen.has(job.applyLink)) return false;
                seen.add(job.applyLink);
                return true;
            });
        }
    },
    {
        name: "JSearch",
        enabled: !!process.env.JSEARCH_API_KEY,
        fetchJobs: async (country) => {
            const apiKey = process.env.JSEARCH_API_KEY;
            console.log(` Fetching from JSearch API for location: ${country}...`);

            const query = `junior software developer intern Philippines`;
            const url = `https://jsearch.p.rapidapi.com/search-v2?query=${encodeURIComponent(query)}&num_pages=1&country=ph&date_posted=month`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "x-rapidapi-key": apiKey,
                    "x-rapidapi-host": "jsearch.p.rapidapi.com"
                }
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`JSearch responded with status ${response.status}: ${errText}`);
            }

            const data = await response.json();
            const rawJobs = (data.data?.jobs || []).filter(job =>
                job.job_apply_link &&
                job.employer_name &&
                job.employer_name.trim() !== ""
            );

            return rawJobs.map(job => {
                const { techTags, workMode, experienceLevel } = analyzeJobMetaData(job.job_title, job.job_description);
                return {
                    title: job.job_title,
                    company: job.employer_name,
                    location: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_country,
                    description: job.job_description?.slice(0, 300) || "",
                    applyLink: job.job_apply_link,
                    salary: job.job_min_salary ? `${job.job_min_salary} - ${job.job_max_salary}` : "",
                    source: "JSearch",
                    postedAt: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : new Date(),
                    techTags,
                    workMode,
                    experienceLevel
                };
            }).filter(job => job.experienceLevel !== "any");
        }
    }
];


async function runSync() {
    console.log("Starting Multi-Country Job Aggregation Sync...");
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB Atlas");
    } catch (dbErr) {
        console.error("Database connection failed: ", dbErr.message);
        process.exit(1);
    }

    let totalUpserted = 0;

    for(const source of jobSources){
        if(!source.enabled){
            console.log(`Source "${source.name}" skipped (API key not configured).`);
            continue;
        }
        console.log(`Syncing source: "${source.name}"...`);

        for(const country of COUNTRIES_TO_SYNC){
            try{
                const standardizedJobs = await source.fetchJobs(country);
                console.log(`Found ${standardizedJobs.length} jobs in ${country}.`);
                for(const jobData of standardizedJobs){
                    await Job.findOneAndUpdate(
                        { applyLink: jobData.applyLink },
                        jobData,
                        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
                    );
                    totalUpserted++;
                }
            } catch(err) {
                console.error(`Error syncing source "${source.name}" for ${country}: `, err.message);
            }
        }
        console.log(`Completed sync for "${source.name}".`);
    }

    console.log(`Sync Finished! Total jobs added/updated in MongoDB: ${totalUpserted}`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB Atlas");
}


runSync();
