---
type: knowledge
status: active
domain: career-leadership
date: 2026-03-19
source: library-import
---

# Transcript: Interview-26-analytical_growth-problem_statement_1_google_maps_traffic_congestion

**Generated:** 2026-02-06 02:16  
**Source Video:** Interview-26-analytical_growth-problem_statement_1_google_maps_traffic_congestion.mp4

---

## Full Transcript

So, let's look at this problem, which is how will you measure congestion in Bangalore?
And we are talking as a PM at Google, right?
So, as a PM at Google, which means that you have access to Google Maps.
So, this is a very interesting problem in the sense that what you will realize is in
real product management when we go after sort of defining metrics and goals and everything.
One of the key challenges is measuring basically more subjective areas, which people often complain
about.
So, people complain about congestion, traffic, people, sometimes, for example, people complain
about not having a good experience in a theater.
So, how do you quantify these things is a very, very crucial PM skill.
And that's the reason I first started with this problem in analytical section because
I wanted you all to appreciate the gravity of these sort of questions.
To give you an example, for example, like one of the theaters actually started measuring
the pitch of claps, as like how entertaining was the show number of times people clapped
and all that.
And even in IPL, you would see that we have started measuring the sound loud, the noise
is after a four or six or after a weekend, right?
So people come up with good innovative ways to measure things which are not very measurable,
which is how excited the public is in IPL, how excited people are in a theater or when
people complain about congestion or traffic about Bangalore, what is it, how can we measure
that?
Now, this is a problem around that and I wanted to explain a little bit on why this problem
exists in the analytical section of the PM interview.
Now, to solve this problem, we are not going to use like a very, very clear road, clear
sort of framework because there's a very simple problem and something that can be solved by
just following, first of all, like why do we want to measure?
So why behind it?
And second is coming up with ways which is like these are the metrics, these are the
possible set of metrics, right?
So hypothesis on set of metrics and then finally, actually narrowing down to which
ones are actually good ones, which ones are not the good ones, right?
So then filter out the good ones.
Now, if we are, if we started first question, which is why do we want to measure congestion
in Bangalore?
The clear answer to that is because it actually helps as a Google Maps PM or as a Google
PM, it helps you communicate to the end user the state of traffic in Bangalore.
So imagine a person who is leaving at eight o'clock from their home and their office is
15 kilometers away, they are using Google Maps to plan their, like when should they
leave from their home?
Now, Google Maps needs to quantify few things for them to actually plan their trip very,
very well.
The first thing is Google Maps needs to tell them how much time will they need?
To reach.
Second thing, and this is something that Maps does not actually tells you in real life,
but it actually, if you look at a possible future date at which you want to leave from
your home to office, it actually gives you, what it gives you is a range, right?
And that is basically what is the buffer time, because what you'll realize is even if sometimes
Maps tells you that you'll reach somewhere in 45 minutes, what it might take you like
somewhere around 50 to 55 minutes.
And in some cases, this could even be one hour, right?
So we want to have a good sense of how much time will we need to reach this place?
And what is the buffer time?
So these are like two things which we need to know in order to plan our trips better.
And this is where defining congestion can actually help, which is when we say that this
is a congested route to a user, what does it mean?
We can tell them like, okay, usually, for example, if I break this down, usually X is
the amount of time which you can take to move from point A to B without much traffic.
So if you leave at night, when there is not much traffic, you take X minutes.
At this particular time, if you leave, you take Y minutes.
And this Y by X, you can call it basically congestion coefficient.
I'm just giving a fancy name, but you can call it like, this ratio is what matters.
So this ratio, if this ratio is very high, what it means is basically the congestion
is higher than a usual time, like free flowing time.
And then you have to add a buffer, which is Z, right?
And buffer is usually, basically, what you can do is you can take a look at all historical
times, broadly, and you can say that of n number of times, how many times did we sort
of exceed the time that we estimated?
So there is estimated time, and this is actual time.
So this ratio is buffer ratio, right?
So actual time by estimated time is a buffer that you provide.
And if you provide these two areas, like these two metrics to the end users, I think the
end user will be fine with having a good sense of what the congestion is in a particular
route.
So this is broadly like how you talk about goals and broad metrics.
Now the thing is, when it comes to Bangalore specifically, we are talking about defining
congestion in Bangalore, right?
We have talked about the goal of defining congestion with respect to Google Maps.
We have talked about how to think about congestion in general, but we have not talked about congestion
in Bangalore.
So this is where you say, now let's focus on Bangalore.
Now if I want to talk about what is the state of traffic congestion in Bangalore, I need
to do a few things.
First of all, like we need to look at all routes.
So there is route IDs, different routes, route ID 1, 2, 3, 4, and these could be the
major routes, which is like let's say the Outer Ring Road or major roads, like the MG
Road and all that.
So route IDs and then what I want to do is, I want to look at basically what is the free
flowing time, what is the congestion and what is the buffer.
And this I have to map at different hours of the day.
So hours of the day, days of the week, right?
So hours of the day, days of the week, because there is also seasonality, for example, during
any season, the congestion increases during holidays, congestion decreases and all that.
And all in all, what this will give me, if I create this simple table, what this will
give me is how congested is Bangalore overall.
So something like a overall congestion score.
What it will also give me is basically which areas, areas that are most congested or routes
that are most congested and then routes which are least congested.
We can also publish like basic stats, like in general, like in Bangalore, you should
take this much of buffer time during peak hours and blah, blah, right?
So this is basically how we can measure the congestion in Bangalore.
The last thing is, if you look at, basically last thing is you can also look at like the
difference between peak times.
And when the road is almost like traffic free, you can also compute this ratio.
So if you go on Google and Google this, this is something called a travel time index.
While you don't need to actually come up with this in the interview, because this ratio,
this ratio, thinking about Bangalore in general is enough for you.
I would say like, you can talk about at least the peak times and the times in traffic is
free so that you can provide this information to the user around peak times and all that.
So this report in itself, for example, can be very, very useful to a citizen in Bangalore.
This can be very, very useful to even traffic police.
This can be very, very useful for municipality to sort of identify areas on where they can
focus and all that.
And finally, this can be very, very useful to the government, governance bodies like
budgeting and all can be located at government levels, right?
So this report is very, very useful to the governance as well as the citizens.
What we identify from this can be an input into Google Maps.
And Google Maps already works like that, which is it takes all the different people traveling
at different speeds from place A to place B and uses a very, very complex algorithm
to compute congestion and estimates like time that you need to take from place A to B, right?
And it takes care of the buffer, it takes care of congestion and everything.
So Google Maps already sort of measures this whole thing in some way and it also denotes
different lines.
For example, there is like, if the travel time isn't red versus it is in yellow versus
it is in green or blue, it means different things, right?
If it isn't red, which means that the buffer time could be higher.
Yellow means, I think we will almost like reach, it is the, the congestion coefficient
is not that high and buffer time is also not that high.
If it is green or blue, it means that you can just expect to arrive as close to free-flowing
sort of traffic or trafficless road, right?
So this is broadly how you would talk about how do you measure congestion in Bangalore.
Now remember we started here, which is like why and while discussing why only we could
very easily arrive on if this is the why, like what are the different metrics that matter.
You could have taken a different route also, you could have discussed this why, you could
have gotten to like how much time will the need to reach and you could have just focused
on that time taken to reach can be computed by basically we have all the smartphone data
we also have satellite data and I believe like Google also ties with different common
bodies to get traffic data, right?
But the most reliable among them is actually smartphone data because it tells you at what
time is a user moving at what speed and because Google Maps is present in like almost all
the people who drive vehicles, it has a very strong network effect and it also has a very
strong data.
But in absence of this data, I think we have to rely on the traffic cams data and satellite
data to understand and read congestion on the road at different times of the day.
What you can say is time taken to reach, these can be the data sources and what we have to
derive from this is basically the same table which is on different routes remember this
has to be on a route level because if you try to compute it on a Bangalore level, what
happens is at a Bangalore level if you are not doing it like point to point point A to
point B if you are saying that overall Bangalore will compute congestion, it is a bad metric
because it becomes an average, it is not very actionable for the user or anyone.
So the goal actually does not get met if you start at a city level.
So you will say, I will take a route from place A to place B, you try to solve for this,
you say that okay, based on the smartphone data, we will look at different times of the
day and will get different times of day, how much time are people taking to reach from
place A to place B and then we will compare like when there is a lease time and there is a max
time and possibly the ratio, this is by the way the critical time travel index.
So this is like time travel index will compute, you do not need to name it by the way time
travel index, you can call it like condition coefficient or something.
So max time during 9am and lease time during let us say 12am and the ratio of this is basically
will help me understand like how much extra time do people need to travel at peak times,
how much extra time do they need to travel at let us say 12pm and all that and I can just
use this historical data, remove outliers and then I can just create a simple like algorithm
that predicts the travel time and this algorithm will be based on this historical hourly data,
different smartphone data, removing outliers, leaning data and finally creating this ratio.
Along with this I think buffer time is also needed because what you will realize is I think max
will be an average of what everybody took and min will be average of what everybody took but
what this metric does not cover is the variance because we are taking average what can happen
is this is a very very simple ratio but what we also need to know is okay usually 1.5x time
is what it needed peak time versus like minimum time but then plus minus x percent is the buffer
so you also need to calculate buffer right so that's why like even if you go via this route
you'll still arrive at similar conclusions so like I said like there's no set structure in
which you need to solve this problem as long as you talk about the goals and you actually follow
the prompt to solve this problem even here for example you'll wrap with saying that for city
we will look at different point A to B different routes we will calculate this we will share this
like this can be used in other ways also we can share this with municipality we can share this with
traffic planning community and all that let's say this is how you solve this particular problem.

