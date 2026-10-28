## **Overview**

This assignment shows us how you think about quality, not just how you write tests. There are two parts: a short test strategy for a feature that hasn't been built yet, and a few automated tests plus one bug report for a working application.

There is no single right answer and no required format. How you scope the work, which tools you pick, and what you choose to leave out are all part of what we're evaluating.

**Ground rules**

* Spend 1 to 2 hours, and send your work within 24 hours of receiving this assignment. Please stop at 2 hours. We would rather see good judgment about scope than complete coverage.  
* Use any languages, frameworks, and tools you like. AI assistants are allowed; tell us how you used them, and be ready to explain anything you submit.  
* If something is unclear, make a reasonable assumption, write it down, and keep going.  
* Note what you would do next with more time.

## **Part 1: Test strategy (about 30 minutes)**

Below is a feature brief, written the way briefs often arrive: short and incomplete. Assume a small team of developers is about to start building it and you are the QA Lead on the project.

> **Feature brief: Bulk Alt Text Review**

> Our accessibility tool integrates with an LMS and scans course content for issues. We want to add a page where instructors can review every image in their course that is missing alt text.

> From this page, instructors can type new alt text for each image and save it. Saving updates the image everywhere it appears in the course. Instructors can also mark an image as decorative instead.

> The page should load quickly, even for large courses. Only users who are allowed to edit the course should be able to save changes.

In half a page or less, tell us:

* The three biggest quality risks, how you would cover each (unit, integration, end-to-end, or manual), and which would hold up a release  
* The three questions you would ask the Product team before development starts

Bullet points are fine. We are looking for judgment, not polish.

## **Part 2: Automated tests and a bug report (about 60 minutes)**

Build automated tests for [Restful Booker Platform](https://automationintesting.online), an open-source practice application built for testers. It is a small bed-and-breakfast website with a public booking site, an admin area, and a set of REST APIs behind both. The source code and admin credentials are on [GitHub](https://github.com/mwinteringham/restful-booker-platform).

Write two or three automated tests for the workflows you consider most important, with at least one test at the API level and one in the browser. Tools and structure are up to you.

Include a short README with:

* How to run your tests  
* Why you chose these tests, and what you would add next  
* One bug report for the most important issue you noticed while working, written as you would file it for a developer on your team

One thing to know: the hosted instance is shared with other people and resets itself to seed data every 10 minutes. How your tests cope with that is up to you.

## **Submission**

Within 24 hours of receiving this assignment, send us a link to a repository (GitLab or GitHub, public or shared with us) or a zip file. Your Part 1 answer can go in the README.

In the follow-up interview, you'll spend about 30 minutes walking us through your work. Expect questions about your trade-offs, how you would run your tests in CI, and how you would get the developers building the Part 1 feature to own their share of its testing. We may also ask you to make a small change to one of your tests live.

