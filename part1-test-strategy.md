## Part 1: Test Strategy — Bulk Alt Text Review

**Assumptions:** 

- "Everywhere" = every course location referencing the same image file.
- "Decorative" is saved as `alt=""`. Edit rights come from the user's LMS role.

### Top three risks

1. **Saving writes wrong, partial, or stale content to the LMS** - *blocks release*

   One save changes many places in the course, so a missed reference, a failed write partway through, or overwriting a newer LMS edit corrupts course content.
   **Unit:** finding image references (URL variants, same file under different paths).
   **Integration:** stubbed LMS API for partial failure and conflicts.
   **E2E:** one image on 3 pages → save → all 3 updated.

2. **Users without edit rights can save** - *blocks release*

   A security and trust issue for schools, not just a bug.
   **API tests** on the save endpoint for each role (instructor, TA, student, expired session, other course). The server must enforce the check; hiding the Save button is not enough.
    **E2E:** a user without edit rights can't save from the page.

3. **The scan misses images, so the course looks compliant when it isn't** - *blocks release*

   Schools rely on this list being complete. Images in quizzes, announcements, embedded HTML, SVGs or uploaded files are easy to miss, and a gap is a compliance problem, not just a bug.
   **Integration:** a seeded course with one image in every content type; the scan must find all of them.
   **Manual:** exploratory runs on a few real course exports.

**Release gates (not top risks):** page load within the agreed target on a seeded 2,000+ image course (performance test in CI), and a manual accessibility pass on the page itself (keyboard, screen reader). An accessibility tool has to be accessible.

### Questions for Product

1. **If a save fails on some pages, what should happen?** Say an image appears on 10 pages and the LMS rejects one. Do we undo the other 9, or keep them and show which page failed? This decides how risk 1 is built and tested.
2. **What's the largest course we must support, and how fast must the page load for it?** For example, 2,000 images with the first results in under 2 seconds. Without a number, the performance gate has no exit criteria.
3. **Can users without edit rights open the page at all?** The brief only limits saving. Do TAs, observers and admins get a read-only view, or no access? This decides what risk 2's E2E test checks.
