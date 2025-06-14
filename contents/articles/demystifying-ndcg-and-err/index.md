---
source: "external"
title: "Demystifying nDCG and ERR"
template: "external.pug"
type: "blog"
external_url: "https://opensourceconnections.com/blog/2019/12/09/demystifying-ndcg-and-err/"
author: "Max Irwin"
description: "We unwrap the mystery behind two popular search relevance metrics nDCG and ERR through visualization, and discuss their pros and cons."
image: "https://opensourceconnections.com/images/DCG-formula-annotated.png"
date: "2019-12-09T10:00:00+00:00"
---

We unwrap the mystery behind two popular search relevance metrics nDCG and ERR through visualization, and discuss their pros and cons.

---

Demystifying nDCG and ERR
We unwrap the mystery behind two popular search relevance metrics nDCG and ERR through visualization, and discuss their pros and cons.
Welcome back, dear reader! In this post, we unwrap the mystery behind two popular search relevance metrics through visualization, and discuss their pros and cons. Our subjects for this exercise are Normalized Discounted Cumulative Gain, and Expected Reciprocal Rank, commonly acronymified as nDCG and ERR. We’ll start with some refresher background, visualize what these metrics actually look like, and paint a picture of how each can be either helpful or misleading, depending on the situation. Afterwards, you’ll have a better understanding of their behavior and which ones to use when (and why).
Assumptions
Note that, while some basic things are explained, this is not an introduction to these metrics – so I’ll assume you’ve at least heard of nDCG and what it’s used for! So if you’re new to relevance measurement, you probably want to start with something like the book “Relevant Search”, or at the very least the Wikipedia article on search metrics.
As a formality, we’ll stick with the relevance grading scale of poor=1, fair=2, good=3, and perfect=4. We’re also only going to look at the grades of the top 4 result positions, and assume each of those results has a grade.
We’re going to also assume that your results are listed one at a time on each row, and not on a grid. There are varying opinions on how best to measure grid results, but that’s beyond the scope of this post.
OK! No more assumptions, let’s get to it…
Background
nDCG has been the go-to metric for measuring relevance in a typical search results list since its first introduction in SIGIR 2002. In the original ERR paper, improvements over its predecessor were mightily touted. However, though being around for about a decade, ERR is surprisingly underused.
The similarities shared between the two metrics are, as noted in the title, the discount and cumulative functions of relevance. These respectively mean that a result is ‘worth’ less the lower on the result list appears, and the grades of all the documents in the list contribute to the score for a query’s relevance. When I spoke at Haystack in April, I showed a simple breakdown of DCG while diagraming the components of the formula:
To get a DCG score, just follow these steps!
For all the resultsAward a result by its relevancePunish a result by its rankAdd all the result scores
Step 3 in the above diagram is the ‘discount’, and step 4 is the ‘cumulative’. Together they provide the motivation to get relevant documents to the top (and the irrelevant documents to the bottom) to acheive a higher overall score. nDCG has an additional trick up its sleeve – it uses the ideal list of documents to normalize the score between 0 and 1:
While this is helpful (or not, depending on your math chops), it’s hard to tease out the full picture. For one thing, it doesn’t use any sort of maximum grade. Grades can be anything, and this can be troublesome when performing apples-to-apples comparissons between results. We’ll see why later, but first let’s dive into Expected Reciprocal Rank, and its purported improvements over nDCG.
The first thing ERR incorporated as a fix, was that you must outright declare what the maximum possible grade is. This helps by not needing to calculate an ‘ideal’ score, but it also can be misleading because it assumes there are always relevant documents available. Another addition is the cascading model of relevance. When a user sees a search result they like, they are satisfied. Starting with the understanding that a user will lose trust in your search engine the longer it takes them to be satisfied is the cascade. It works by keeping a running tab of this ‘trust’ a user has, and punishes a query’s score when it’s not satisfying a user quickly.
Showdown
Whew! With that out of the way, time for the fun part. Let’s look at how these two actually differ in the real practical world. To do that, we’re going to map out every possible combination of grades for the top 4 positions, get their scores, and plot them. The Y axis is the resulting score based on its respective X axis grades of the top 4 results. For example, given the first four results with grades 2, 4, 3, 2, that gives us a standard nDCG of 0.7697. The Y axis is 0.7697, and the X axis is “2,4,3,2”. To make things more interesting, we’ll also look at different discount models. We can change the way lower scores are punished, and it is useful to see how this impacts the metric. The standard for nDCG is 1/log2(r+1), and the standard for ERR is 1/r (where ‘r’ is the position rank).
Noting specifics, for the standard discount model of nDCG, right away we start off at about 0.45. This means that for the top four results, you’ll never have a score lower than that. You can also see that lots of the possible combinations for nDCG yields a perfect score of 1.0. Why is this? Well, If your top four results are 1,1,1,1 nDCG will say that’s a perfect score because the ideal sort is the same. We’re going to actually list out the full table below, and you’ll see more of that harsh truth there.
But first, let’s show the visuals for ERR and compare:
Fascinating. You can clearly see the juxtaposition of nDCG favoring higher scores, and ERR with a more balanced growth. You can also clearly see the dropoff cliff in the ERR scores as soon as the top result becomes a 4 (perfectly relevant). For many of the discounts, ERR heavily favors queries that give a perfect first result. This is not surprising – because the user will be satisfied immediately, making the other results inconsequential.
You may have also noticed something interesting when examining the discount functions. Did you happen to catch 1/(r^0.18)? I arrived at that function through human learning (trial and error), looking for a good discount that provided a more gradual dropoff when the first result was not perfect. While this makes for a more balanced metric however, it can be seen as going against the cascading model’s purpose. With the far more drastic cliff of 1/r (the green line), there will be a much clearer signal for an irrelevant top result.
Pros and Cons
The visualizations above (and the data tables below), gave us an interesting glimpse into the behavior of these two formidable metrics.
nDCG
nDCG is a great metric when you’ve done your best job at grading, and don’t mind a high score when you have nothing better to offer. Remember, nDCG will return a perfect 1.0 for any result set that has the grades in order of highest to lowest in the resultset. When using nDCG, I always recommend using the global ideal rather than the local ideal. This means that when you know a better document exists is out of your measurement scope (like the 10th document in an nDCG@4 measurement), use that as part of your ideal and avoid just sorting the top 4. Also, for learning-to-rank, consider just using DCG without the normalization! If the goal is a higher number, nobody cares that it’s between 0 and 1. nDCG also has no way to indicate what the maximum score is. To get around this, sometimes it might suit well for the ideal to be all perfect scores for the positions as a best theoretically possible relevant set, as the ideal denominator.
ERR
The default ERR is a great metric for providing a good signal whether the top result is relevant. Some practitioners will argue this is all it’s good for, but If you are serving content that needs more flexibility, you can also tune the discount function for when this is not the case and you want more forgiveness. One interesting thing about ERR is that it never returns a perfect 1.0 score, and it will always assume that the score can be better, which is a main contrast with nDCG and one I happen to like.
Conclusions
In this authors opinion, I prefer using ERR and modifying it to your needs for most cases. It is more advanced than nDCG and may be more complex to explain, but it’s more closely aligned with how people actually behave and react – people do get frustrated with search engines that don’t show relevant documents at the top, so it’s a good idea to use a metric that models that frustration. There are those that argue for information needs with multiple good results (such as exploratory search), that ERR doesn’t accurately reflect this, but there are ways to customize ERR to build the desired measurement – the paper itself has a section on diversity for such occasions, which usually goes overlooked.
Thanks for reading, and see you next time!
Papers
nDCGERR
Code
The code used to create the above plots and the data tables below can be found at https://github.com/o19s/metric-plots
Data Tables
Here are the colorized data tables for nDCG and ERR, as visualized above.
nDCG
Position GradesDiscounted Scores12341/r^0.181/r^0.51/log2(r+1)1/r2/2^r11111111111120.9190.7910.750.6330.54811130.860.6580.6010.4430.33311140.8230.5830.5190.3470.22811210.9350.8230.7810.6730.61311220.9220.7970.760.6390.53811230.8710.680.6260.4680.35211240.8330.6010.5380.3660.24411310.8860.7110.650.5050.42911320.8860.7110.6540.5050.40811330.8850.710.660.5040.37911340.8480.630.570.3970.27211410.8560.6470.5770.420.33911420.8590.6520.5850.4240.33311430.8620.6590.5970.4320.32511440.8670.670.6140.4440.31112110.9570.8780.8380.7550.74212120.9390.8390.8040.7050.64112130.8820.7060.6520.5050.40812140.8390.6150.5530.3850.27412210.950.8640.8280.7380.69212220.950.8640.8330.7390.67412230.8970.7360.6840.5380.4412240.8520.6380.5770.4080.29512310.9040.7510.6950.560.49312320.910.7630.710.5730.49312330.9040.7520.7050.560.45112340.8630.6610.6020.4350.31612410.8690.6750.6070.4540.37812420.8760.6860.6210.4650.38112430.8770.6890.6280.4680.36812440.8780.6930.6380.4740.34813110.9260.80.7410.6290.61913120.9190.7870.7340.6150.57713130.910.770.7230.5940.51713140.8640.6670.6080.450.35113210.9260.8020.7480.6330.60613220.9290.8090.7580.6410.613230.9190.7880.7440.6170.53813240.8730.6840.6270.4680.36813310.9270.8050.7570.6390.58613320.9290.810.7650.6450.58213330.9330.8180.7770.6560.57613340.8880.7140.6590.5020.39913410.890.7190.6560.5110.44413420.8940.7260.6660.5190.44513430.90.7390.6820.5340.44813440.8970.7330.6820.5280.41514110.9060.7560.6880.5650.55914120.9040.7520.6880.5610.54114130.9010.7460.6870.5550.5114140.8960.7380.6860.5450.46414210.9080.760.6950.5710.55614220.9110.7670.7040.5770.55414230.9070.7590.7020.570.52314240.9020.7490.6980.5580.47614310.9120.7680.7070.5810.5514320.9140.7730.7150.5860.54814330.9180.7820.7270.5970.54614340.9110.7680.7190.5810.49714410.9160.7780.7240.5960.54114420.9180.7820.730.60.5414430.9210.7880.7390.6080.53814440.9250.7990.7540.6220.53621111111121120.9710.9330.9310.9020.84621130.9030.7630.7270.6150.52121140.8520.6480.5940.4440.33321210.9830.9580.9550.9340.89721220.9770.9440.9410.9130.8621230.9150.7870.7530.6410.54721240.8630.6690.6160.4650.35321310.9250.8090.770.670.60621320.9280.8150.7780.6750.621330.9180.7930.760.6450.53821340.8730.6870.6370.4850.36821410.8820.7070.6490.5120.43721420.8870.7170.660.5210.43921430.8860.7150.6630.5190.41921440.8860.7140.6660.5160.3922111111122120.9910.9790.980.9710.95322130.9250.810.7770.6750.622140.8690.6820.630.4840.38122211111122221111122230.9390.8380.8050.7070.63622240.8820.7050.6530.5070.40422310.9440.8510.8150.7260.6822320.950.8630.8290.740.68822330.9370.8340.8030.7010.61322340.8880.7190.6690.5230.41422410.8970.7380.6810.5490.48222420.9040.7510.6950.5620.48922430.9010.7450.6940.5560.46522440.8970.7380.6920.5460.42923110.9580.8850.850.780.77523120.9570.8830.8510.7780.7623130.9410.8480.8190.730.6723140.8880.7230.6730.5360.44523210.9640.8970.8640.7950.78723220.9680.9050.8740.8050.79223230.9510.8680.840.7550.69923240.8980.7410.6920.5560.46523310.9560.8810.850.7730.73623320.960.8890.8590.7820.74223330.9580.8860.860.7790.72323340.9090.7650.7180.5830.49123410.9120.7710.7190.5950.53523420.9170.7810.730.6050.54123430.9210.7890.7410.6140.53923440.9130.7740.7310.5960.49224110.9270.8070.7520.6490.64424120.9290.810.7570.6530.6424130.9220.7970.7490.6370.624140.9130.7790.7360.6140.5424210.9330.8180.7650.6620.65524220.9370.8270.7750.6710.6624230.930.8130.7650.6540.61824240.920.7920.7490.6290.55624310.9320.8180.7680.6620.63924320.9360.8260.7770.6710.64324330.9380.830.7840.6760.63624340.9270.8070.7660.6480.57424410.9320.8180.7730.6630.61524420.9350.8240.780.670.61924430.9360.8270.7850.6740.61424440.9380.8320.7950.6810.60631111111131120.9820.9590.9590.9450.91531130.9580.9050.9030.8650.79331140.8950.7510.7170.6070.5131210.9890.9750.9730.9630.94431220.9840.9640.9630.9490.9231230.9620.9120.910.8720.80231240.9020.7640.730.620.52331310.9750.940.9360.910.86231320.9720.9340.9310.9010.84631330.9680.9250.9220.8850.81831340.9140.7860.7530.6440.54631410.9210.8020.7650.6680.60331420.9230.8050.7690.6710.631430.9260.8110.7770.6760.59531440.9170.7920.760.6480.53832111111132120.9940.9860.9870.9830.97332130.970.9310.930.9010.84632140.9070.7750.7430.6370.54832211111132221111132230.9770.9450.9440.9180.87132240.9160.7920.7590.6540.56732310.9850.9630.9610.9430.91232320.9860.9660.9630.9460.91432330.9810.9530.9510.9260.88132340.9250.8110.7790.6760.58832410.9310.8240.7880.6960.63932420.9350.8320.7960.7040.64332430.9370.8350.8020.7070.63632440.9260.8120.7810.6740.57433111111133120.9950.9890.990.9860.97833130.9870.9720.9730.9620.93933140.9270.8180.7870.6920.6233211111133221111133230.9920.9820.9830.9750.9633240.9340.8310.80.7070.63633311111133321111133331111133340.9450.8540.8240.7340.66933410.9480.8620.8290.7470.70633420.9510.8670.8350.7530.70933430.9560.8770.8460.7640.71633440.9430.8480.8190.7240.64234110.9590.8890.8550.790.78834120.9580.8870.8550.7890.78134130.9570.8850.8560.7870.76734140.9420.8520.8250.7410.68234210.9620.8940.8620.7970.79434220.9640.8990.8670.8020.79634230.9620.8960.8670.7990.78234240.9470.8620.8350.7520.69534310.9660.9040.8740.810.80434320.9680.9080.8780.8150.80634330.9710.9150.8860.8230.81134340.9550.8790.8530.7740.72134410.9590.8880.8590.7870.75434420.960.8910.8630.7920.75634430.9640.8980.8710.7990.76134440.9620.8940.870.7950.74241111111141120.9890.9770.9780.9710.95641130.9730.9410.9410.9210.88141140.9510.8910.890.8480.7741210.9940.9860.9850.980.9741220.990.9790.9790.9720.95741230.9750.9440.9440.9240.88441240.9540.8960.8940.8530.77541310.9840.9630.9610.9480.92141320.9810.9580.9570.9410.9141330.9780.9490.9490.9290.8941340.9580.9040.9010.860.78541410.9710.9320.9280.8990.84741420.970.9290.9250.8950.8441430.9680.9240.9210.8870.82641440.9650.9170.9130.8740.80142111111142120.9960.9920.9930.9910.98642130.980.9560.9560.9410.9142140.9580.9050.9040.8670.79742211111142221111142230.9840.9640.9640.9510.92442240.9620.9140.9120.8760.8142310.990.9770.9750.9660.94842320.990.9780.9760.9670.94942330.9860.9680.9670.9540.92742340.9660.920.9180.8830.81742410.9760.9440.940.9160.87242420.9770.9460.9420.9180.87342430.9750.940.9370.9090.85842440.9710.9310.9280.8940.83143111111143120.9970.9930.9940.9920.98743130.9910.9810.9820.9760.96343140.9690.930.9290.90.84643211111143221111143230.9940.9880.9890.9850.97643240.9730.9370.9360.9090.85843311111143321111143331111143340.9790.950.9480.9250.88143410.9860.9660.9630.9470.91843420.9860.9670.9640.9480.91943430.9870.9690.9660.950.9243440.9820.9560.9540.9320.88944111111144120.9970.9940.9950.9930.98944130.9930.9850.9850.980.96944140.9860.9690.970.9580.93444211111144221111144230.9950.990.9910.9870.9844240.9880.9740.9750.9650.94444311111144321111144331111144340.9930.9840.9840.9770.963444111111444211111444311111444411111
ERR
Position GradesDiscounted Scores12341/r^0.181/r^0.51/log2(r+1)1/r2/2^r11110.1590.1360.1270.110.10611120.1590.1360.1270.110.10611130.1590.1360.1270.110.10611140.1590.1360.1270.110.10611210.2490.1990.1820.1470.13311220.2490.1990.1820.1470.13311230.2490.1990.1820.1470.13311240.2490.1990.1820.1470.13311310.430.3260.2920.220.18811320.430.3260.2920.220.18811330.430.3260.2920.220.18811340.430.3260.2920.220.18811410.790.580.5110.3660.29811420.790.580.5110.3660.29811430.790.580.5110.3660.29811440.790.580.5110.3660.29812110.2570.2140.1970.1660.16212120.2570.2140.1970.1660.16212130.2570.2140.1970.1660.16212140.2570.2140.1970.1660.16212210.3350.2690.2450.1980.18612220.3350.2690.2450.1980.18612230.3350.2690.2450.1980.18612240.3350.2690.2450.1980.18612310.4910.3790.340.2610.23412320.4910.3790.340.2610.23412330.4910.3790.340.2610.23412340.4910.3790.340.2610.23412410.8040.5990.530.3880.32912420.8040.5990.530.3880.32912430.8040.5990.530.3880.32912440.8040.5990.530.3880.32913110.4520.3720.3380.2790.27613120.4520.3720.3380.2790.27613130.4520.3720.3380.2790.27613140.4520.3720.3380.2790.27613210.5060.410.3710.3010.29213220.5060.410.3710.3010.29213230.5060.410.3710.3010.29213240.5060.410.3710.3010.29213310.6140.4860.4370.3440.32513320.6140.4860.4370.3440.32513330.6140.4860.4370.3440.32513340.6140.4860.4370.3440.32513410.830.6380.5680.4320.39113420.830.6380.5680.4320.39113430.830.6380.5680.4320.39113440.830.6380.5680.4320.39114110.8410.6860.6190.5030.50314120.8410.6860.6190.5030.50314130.8410.6860.6190.5030.50314140.8410.6860.6190.5030.50314210.8470.690.6230.5060.50514220.8470.690.6230.5060.50514230.8470.690.6230.5060.50514240.8470.690.6230.5060.50514310.8590.6990.630.510.50814320.8590.6990.630.510.50814330.8590.6990.630.510.50814340.8590.6990.630.510.50814410.8830.7160.6440.520.51614420.8830.7160.6440.520.51614430.8830.7160.6440.520.51614440.8830.7160.6440.520.51621110.2710.2510.2430.2290.22521120.2710.2510.2430.2290.22521130.2710.2510.2430.2290.22521140.2710.2510.2430.2290.22521210.350.3060.2910.260.24921220.350.3060.2910.260.24921230.350.3060.2910.260.24921240.350.3060.2910.260.24921310.5060.4160.3860.3240.29621320.5060.4160.3860.3240.29621330.5060.4160.3860.3240.29621340.5060.4160.3860.3240.29621410.8180.6360.5770.4510.39121420.8180.6360.5770.4510.39121430.8180.6360.5770.4510.39121440.8180.6360.5770.4510.39122110.3560.3190.3040.2770.27422120.3560.3190.3040.2770.27422130.3560.3190.3040.2770.27422140.3560.3190.3040.2770.27422210.4240.3670.3460.3050.29522220.4240.3670.3460.3050.29522230.4240.3670.3460.3050.29522240.4240.3670.3460.3050.29522310.5590.4620.4280.360.33622320.5590.4620.4280.360.33622330.5590.4620.4280.360.33622340.5590.4620.4280.360.33622410.830.6530.5930.470.41822420.830.6530.5930.470.41822430.830.6530.5930.470.41822440.830.6530.5930.470.41823110.5250.4550.4260.3750.37223120.5250.4550.4260.3750.37223130.5250.4550.4260.3750.37223140.5250.4550.4260.3750.37223210.5720.4880.4550.3940.38723220.5720.4880.4550.3940.38723230.5720.4880.4550.3940.38723240.5720.4880.4550.3940.38723310.6650.5540.5120.4320.41523320.6650.5540.5120.4320.41523330.6650.5540.5120.4320.41523340.6650.5540.5120.4320.41523410.8530.6860.6260.5080.47223420.8530.6860.6260.5080.47223430.8530.6860.6260.5080.47223440.8530.6860.6260.5080.47224110.8620.7280.670.5690.56924120.8620.7280.670.5690.56924130.8620.7280.670.5690.56924140.8620.7280.670.5690.56924210.8680.7320.6730.5720.57124220.8680.7320.6730.5720.57124230.8680.7320.6730.5720.57124240.8680.7320.6730.5720.57124310.8780.7390.6790.5760.57424320.8780.7390.6790.5760.57424330.8780.7390.6790.5760.57424340.8780.7390.6790.5760.57424410.8990.7540.6920.5840.5824420.8990.7540.6920.5840.5824430.8990.7540.6920.5840.5824440.8990.7540.6920.5840.5831110.4960.4810.4760.4660.46331120.4960.4810.4760.4660.46331130.4960.4810.4760.4660.46331140.4960.4810.4760.4660.46331210.550.5190.5090.4880.4831220.550.5190.5090.4880.4831230.550.5190.5090.4880.4831240.550.5190.5090.4880.4831310.6580.5960.5750.5320.51331320.6580.5960.5750.5320.51331330.6580.5960.5750.5320.51331340.6580.5960.5750.5320.51331410.8740.7480.7070.620.57931420.8740.7480.7070.620.57931430.8740.7480.7070.620.57931440.8740.7480.7070.620.57932110.5540.5290.5180.50.49732120.5540.5290.5180.50.49732130.5540.5290.5180.50.49732140.5540.5290.5180.50.49732210.6010.5620.5470.5190.51232220.6010.5620.5470.5190.51232230.6010.5620.5470.5190.51232240.6010.5620.5470.5190.51232310.6950.6280.6040.5570.5432320.6950.6280.6040.5570.5432330.6950.6280.6040.5570.5432340.6950.6280.6040.5570.5432410.8820.7590.7180.6330.59732420.8820.7590.7180.6330.59732430.8820.7590.7180.6330.59732440.8820.7590.7180.6330.59733110.6710.6230.6030.5670.56533120.6710.6230.6030.5670.56533130.6710.6230.6030.5670.56533140.6710.6230.6030.5670.56533210.7030.6460.6220.580.57533220.7030.6460.6220.580.57533230.7030.6460.6220.580.57533240.7030.6460.6220.580.57533310.7680.6910.6620.6070.59533320.7680.6910.6620.6070.59533330.7680.6910.6620.6070.59533340.7680.6910.6620.6070.59533410.8980.7830.7410.6590.63533420.8980.7830.7410.6590.63533430.8980.7830.7410.6590.63533440.8980.7830.7410.6590.63534110.9050.8120.7710.7020.70234120.9050.8120.7710.7020.70234130.9050.8120.7710.7020.70234140.9050.8120.7710.7020.70234210.9080.8140.7740.7030.70334220.9080.8140.7740.7030.70334230.9080.8140.7740.7030.70334240.9080.8140.7740.7030.70334310.9160.8190.7780.7060.70534320.9160.8190.7780.7060.70534330.9160.8190.7780.7060.70534340.9160.8190.7780.7060.70534410.930.8290.7870.7120.70934420.930.8290.7870.7120.70934430.930.8290.7870.7120.70934440.930.8290.7870.7120.70941110.9440.9420.9420.9410.9441120.9440.9420.9420.9410.9441130.9440.9420.9420.9410.9441140.9440.9420.9420.9410.9441210.950.9470.9450.9430.94241220.950.9470.9450.9430.94241230.950.9470.9450.9430.94241240.950.9470.9450.9430.94241310.9620.9550.9530.9480.94641320.9620.9550.9530.9480.94641330.9620.9550.9530.9480.94641340.9620.9550.9530.9480.94641410.9860.9720.9670.9580.95341420.9860.9720.9670.9580.95341430.9860.9720.9670.9580.95341440.9860.9720.9670.9580.95342110.950.9480.9460.9440.94442120.950.9480.9460.9440.94442130.950.9480.9460.9440.94442140.950.9480.9460.9440.94442210.9560.9510.950.9470.94642220.9560.9510.950.9470.94642230.9560.9510.950.9470.94642240.9560.9510.950.9470.94642310.9660.9590.9560.9510.94942320.9660.9590.9560.9510.94942330.9660.9590.9560.9510.94942340.9660.9590.9560.9510.94942410.9870.9730.9690.9590.95542420.9870.9730.9690.9590.95542430.9870.9730.9690.9590.95542440.9870.9730.9690.9590.95543110.9630.9580.9560.9520.95243120.9630.9580.9560.9520.95243130.9630.9580.9560.9520.95243140.9630.9580.9560.9520.95243210.9670.9610.9580.9530.95343220.9670.9610.9580.9530.95343230.9670.9610.9580.9530.95343240.9670.9610.9580.9530.95343310.9740.9660.9620.9560.95543320.9740.9660.9620.9560.95543330.9740.9660.9620.9560.95543340.9740.9660.9620.9560.95543410.9890.9760.9710.9620.95943420.9890.9760.9710.9620.95943430.9890.9760.9710.9620.95943440.9890.9760.9710.9620.95944110.9890.9790.9750.9670.96744120.9890.9790.9750.9670.96744130.9890.9790.9750.9670.96744140.9890.9790.9750.9670.96744210.990.9790.9750.9670.96744220.990.9790.9750.9670.96744230.990.9790.9750.9670.96744240.990.9790.9750.9670.96744310.9910.980.9750.9670.96744320.9910.980.9750.9670.96744330.9910.980.9750.9670.96744340.9910.980.9750.9670.96744410.9920.9810.9760.9680.96844420.9920.9810.9760.9680.96844430.9920.9810.9760.9680.96844440.9920.9810.9760.9680.968
