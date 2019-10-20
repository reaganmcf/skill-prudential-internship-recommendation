# Prudential Internship Search Using Alexa
<img src=https://images.squarespace-cdn.com/content/v1/50e469bbe4b015296cec05a6/1561559633534-6BPVBCHNEQJ5VPLHODMY/ke17ZwdGBToddI8pDm48kCX-V5vw-8h9IBXN10-_8XN7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z4YTzHvnKhyp6Da-NYroOW3ZGjoBKy3azqku80C789l0p4Wyba38KfG317vYluk45_zZdtnDCZTLKcP2mivxmYi50xvY5saIGKMgOza9mH4XA/PrudentialRebrand-01.jpg>

This Alexa skill will match a user to intership oppurtunities based on available internship oppurtunities and their required skill set by cross refrencing their user profile with the job descriptions posted on Prudential's website. This skill also allows users to search for Prudential Internships based on keyword.

## Skill Architecture
Each skill consists of three basic parts, a front end, a back end, and a data base.

* The front end is the voice interface, or VUI. The voice interface is configured through the voice interaction model. Additionally, if you have an Echo Show, the device will show pertinent information through each step of the user's conversation with Alexa.
* The back end is where the logic of our skill resides. This is where our algorithm will search through potential jobs an their requirements with user data to detect matches.
* The data base contains all the job information and this is where the user data is stored.

## Job Matching
Alexa will generate a user profile by asking the user simple questions and will match the user with jobs by parsing the job descriptions and returning the matches. At this point, the user can ask for more information on each specific job and Alexa will provide them with a short description and a link to the job, where they can apply through the Prudential Website. The main filters Alexa will use to find potential jobs are GPA, Graduation Year, and Major. If those three filters match, Alexa will then cross reference the skill requirements of each job with the user's specific skill set.

## Keyword Search
Alexa allows users to search for job posting based on keyword. They can prompt a search using a key word or phrase and Alex will reroute them to the Prudential job search website to show them all job postings under that key word.
