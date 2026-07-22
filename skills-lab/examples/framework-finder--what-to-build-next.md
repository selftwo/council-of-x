# Framework Finder: What should a solo AI builder build next, and how do they know it's working?

## The situation

You are one person building AI products. You need to pick your next bet, validate it quickly, and define success metrics. You have no team to run discovery for you and no big user base to survey. Most product frameworks were written for teams inside companies, so the useful test here is: does this framework still work when one person runs it with a handful of users? The five below pass that test, with adaptations noted. Frameworks that got cut: RICE (the Reach estimate is guesswork with no user base), Opportunity Solution Trees (built around a weekly interview cadence a team sustains, though you can borrow the idea), and Dual-Track Agile style processes that assume parallel discovery and delivery staffing.

## 1. Working Backwards (PR/FAQ)

**One line:** Before building anything, write the press release for the finished product, starting from the customer problem, and only build if the document holds up.

**How it applies here:** This is your bet-picking filter. For each candidate idea, spend an hour writing a one-page press release with a real problem paragraph: who is struggling, with what, and why your product fixes it. As a solo builder you skip the review meetings; the document alone does the work, because it forces you to notice when you have a solution looking for a problem, which is the standard failure mode for AI builders who start from a capability ("I could chain these two models") instead of a customer. Ian McAllister warns that the most common mistake is retrofitting the problem after the solution is chosen. He recalls Jeff Bezos reviewing a draft with no problem paragraph and saying, "maybe if you don't have a problem paragraph, there's not really a problem."

**Source:** Lenny's Podcast episode with Ian McAllister (former Amazon, Uber), on what makes a top 1% PM and how Amazon actually works backwards.

## 2. Jobs-to-be-Done (JTBD)

**One line:** People hire products to make progress in their life; demand comes from a struggling moment, not from your product existing.

**How it applies here:** This is your validation method, and it is ideal for a solo builder because it needs roughly 8 to 12 interviews, not a big sample. Before building, find people who recently switched to or paid for something in your target area and interview them about the moment that pushed them to act: what was going on, what they tried first, what the decision looked like. If you cannot find a struggling moment, you have no demand, no matter how impressive the demo. Bob Moesta's core claim is that "a struggling moment causes demand," and his Southern New Hampshire University story shows the pattern: 50 or 60 anomalous students behaving strangely revealed a job that scaled to 200,000 students. Small N, huge signal.

**Source:** Lenny's Podcast episode with Bob Moesta, co-creator of Jobs-to-be-Done with Clay Christensen.

## 3. ICE with the Confidence Meter

**One line:** Score each idea on Impact, Confidence, and Ease, and force the Confidence score to reflect actual evidence rather than how excited you feel.

**How it applies here:** Once you have a shortlist of validated-ish ideas, ICE is the ranking tool. It works solo because it is just a spreadsheet and honest guesses; Gilad and Lenny both argue simpler is better here and that RICE's Reach term can be folded into Impact, which suits you since you cannot estimate reach anyway. The part that matters most for a solo builder is Gilad's Confidence Meter: your own conviction in an idea scores 0.01 out of 10, a nice pitch doc barely more, a few customer conversations gets you to low confidence, and only a real test with users gets you to medium or high. With no teammates to argue with you, this tool is the pushback you are missing. Use it to decide what evidence to gather next, not just to rank.

**Source:** Lenny's Podcast episode with Itamar Gilad (ex-Google, author of Evidence-Guided), covering ICE, the Confidence Meter, and his GIST model. Gilad credits Sean Ellis with inventing ICE.

## 4. The Sean Ellis Test (Superhuman PMF Engine)

**One line:** Ask users "How would you feel if you could no longer use this product?" and measure the percent answering "very disappointed"; over 40% signals product-market fit.

**How it applies here:** This is your leading success metric once anything is live. Be honest about the sample-size problem: the 40% benchmark assumes enough responses to be stable, and with 15 users the percentage will swing wildly. The solo adaptation is to run it small and treat it as segmentation, not a scoreboard. Vohra's engine tells you what to do with each answer: double down on what the "very disappointed" users love, ignore the "not disappointed" users entirely, and mine the "somewhat disappointed" group, but only those who value your main benefit. Of the rest, Vohra says to "politely disregard those people and their feedback," because building everything they ask for still pulls you off course. That discipline matters more when you are one person with no capacity to chase every request.

**Source:** Lenny's Podcast episode with Rahul Vohra (Superhuman), plus Lenny's newsletters "How to know if you've got product-market fit" and "What to ask your users about product market fit," which credit the original question to Sean Ellis.

## 5. North Star Metric

**One line:** Pick one metric that best captures the core value your product delivers, and let it drive everything else.

**How it applies here:** This answers "how do I know it's working" between now and having enough users for the Sean Ellis test. Skip vanity numbers (signups, stars, followers) and pick one usage metric that only moves when someone actually gets value: tasks completed with the product, documents generated and kept, weekly returning users. For an AI product, make it an outcome the model delivered, not sessions or tokens. As Lenny puts it, "Your North Star Metric is your strategy," and for a solo builder that cuts both ways: a wrong metric will quietly misdirect months of your own work with nobody around to question it. Pair it with one or two input metrics you can influence weekly.

**Source:** Lenny's newsletter "Choosing Your North Star Metric," his guide based on a survey of employees at over 40 growth-stage companies (full version published on a16z's Future).

## How this was produced

- Listed all 38 files in `entities/frameworks/` in the Lenny knowledge-graph vault and shortlisted nine candidates relevant to picking bets, validating, and measuring success.
- Grepped `newsletters/` and `podcasts/` for each shortlisted framework name and read the sections where guests explain the actual mechanics, not just the name.
- Kept the five frameworks a single person can run with a small user base; cut RICE, Opportunity Solution Trees, and team-cadence discovery processes, and noted solo adaptations (skip PR/FAQ review meetings, use Sean Ellis for segmentation rather than a threshold).
- Quotes and attributions come directly from the vault's transcripts and newsletter text: the McAllister, Moesta, Gilad, and Vohra podcast files and the three metrics/PMF newsletters.
