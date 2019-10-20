/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
const translations = require('./localization')
const aplUtils = require('./aplUtils');
/**
 * Handler for LaunchRequest sent by Alexa
 * Triggers when the user already has a profile setup in persistent attributes
 */
const LaunchRequestHandlerWithProfile = {
  canHandle(handlerInput) {
    console.log(JSON.stringify(handlerInput.requestEnvelope.request));
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes() || {};
    console.log(JSON.stringify(sessionAttributes));
    const major = sessionAttributes.hasOwnProperty('major') ? sessionAttributes.major : undefined;
    const gpa = sessionAttributes.hasOwnProperty('gpa') ? sessionAttributes.gpa : undefined;
    const grad_year = sessionAttributes.hasOwnProperty('grad_year') ? sessionAttributes.grad_year : undefined;
    const math_skills = sessionAttributes.hasOwnProperty('math_skills') ? sessionAttributes.math_skills : undefined;
    const cs_skills = sessionAttributes.hasOwnProperty('cs_skills') ? sessionAttributes.cs_skills : undefined;
    const management_skills = sessionAttributes.hasOwnProperty('management_skills') ? sessionAttributes.management_skills : undefined;
    const pc_skills = sessionAttributes.hasOwnProperty('pc_skills') ? sessionAttributes.pc_skills : undefined;
    const analysis_skills = sessionAttributes.hasOwnProperty('analysis_skills') ? sessionAttributes.analysis_skills : undefined;
    const datascience_skills = sessionAttributes.hasOwnProperty('datascience_skills') ? sessionAttributes.datascience_skills : undefined;

    let user = {
      major,
      gpa,
      grad_year,
      math_skills,
      cs_skills,
      management_skills,
      pc_skills,
      analysis_skills,
      datascience_skills
    }
    console.log(user)

    return handlerInput.requestEnvelope.request.type === 'LaunchRequest' &&
      major &&
      gpa &&
      grad_year &&
      math_skills &&
      cs_skills &&
      management_skills &&
      pc_skills &&
      analysis_skills &&
      datascience_skills;
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes() || {};

    sessionAttributes.speakOutput = requestAttributes.t('WELCOME_MESSAGE', requestAttributes.t('SKILL_NAME'));
    sessionAttributes.repromptSpeech = requestAttributes.t('WELCOME_MESSAGE_REPROMPT');

    aplUtils.launchScreen(handlerInput)

    return handlerInput.responseBuilder
      .speak(sessionAttributes.speakOutput)
      .reprompt(sessionAttributes.repromptSpeech)
      .getResponse();
  },
};

/**
 * Handles LaunchRequest requests sent by Alexa
 * Triggers when the user already DOES NOT have a persistent attributes
 */
const LaunchRequestHandlerNoProfile = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    sessionAttributes.speakOutput = requestAttributes.t('WELCOME_MESSAGE_NO_PROFILE', requestAttributes.t('SKILL_NAME'));
    sessionAttributes.repromptSpeech = requestAttributes.t('WELCOME_MESSAGE_NO_PROFILE_REPROMPT');

    return handlerInput.responseBuilder
      .speak(sessionAttributes.speakOutput)
      .reprompt(sessionAttributes.repromptSpeech)
      .getResponse();
  }
}

const KeywordScanIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "KeywordScanIntent"
  },
  async handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const slots = handlerInput.requestEnvelope.request.intent.slots
    const keyword = slots.keyword.value

    keyword.replace(" ", "+")

    let url = `http://jobs.prudential.com/job-listing.php?IsThisACampusRequisition=Yes&keyword=${keyword}`

    sessionAttributes.speakOutput = requestAttributes.t(``);
    sessionAttributes.repromptSpeech = requestAttributes.t(`reprompt scanning for ${keyword}`);

    return handlerInput.responseBuilder
      .speak(sessionAttributes.speakOutput)
      .reprompt(sessionAttributes.repromptSpeech)
      .getResponse();
  }
}

const ScanIntentHandler = {
  canHandle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let tempOverrideBool = sessionAttributes.checkYesForSearchOverride;
    sessionAttributes.checkYesForSearchOverride = undefined;

    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && ((handlerInput.requestEnvelope.request.intent.name === "AMAZON.YesIntent"
        && tempOverrideBool == true)
        || (handlerInput.requestEnvelope.request.type === "IntentRequest"
          && handlerInput.requestEnvelope.request.intent.name === "ScanIntent"))
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    //perform scan
    let { major, gpa, grad_year, math_skills, cs_skills, management_skills, pc_skills, analysis_skills, datascience_skills } = sessionAttributes
    let user = {
      major,
      gpa,
      grad_year,
      math_skills,
      cs_skills,
      management_skills,
      pc_skills,
      analysis_skills,
      datascience_skills
    }
    let { perfectMatch, closeMatch } = findFromProfile(user);
    console.log(`perfectMatch: ${JSON.stringify(perfectMatch)}`)
    console.log(`closeMatch: ${JSON.stringify(closeMatch)}`);


    let speechOutput = `There are ${perfectMatch.length} matches, `;
    perfectMatch.forEach((item, index) => {
      speechOutput += `${item.job_title}, `
    })

    sessionAttributes.speakOutput = speechOutput;
    sessionAttributes.repromptSpeech = requestAttributes.t('in scan');

    return handlerInput.responseBuilder
      .speak(sessionAttributes.speakOutput)
      .reprompt(sessionAttributes.repromptSpeech)
      .getResponse();
  }
}
/**
 * Handles GeneralInformationIntent requests sent by Alexa
 */
const GeneralInformationIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GeneralInformationIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    sessionAttributes.speakOutput = requestAttributes.t('GENERAL_INFORMATION');
    sessionAttributes.repromptSpeech = requestAttributes.t('GENERAL_INFORMATION_REMPROMPT');

    return handlerInput.responseBuilder
      .speak(sessionAttributes.speakOutput)
      .reprompt(sessionAttributes.repromptSpeech)
      .getResponse();
  }
}

const GeneralInternshipInformationIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "GeneralInternshipInformationIntent"
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    sessionAttributes.speakOutput = requestAttributes.t('GENERAL_INFORMATION_ABOUT_INTERNSHIPS');
    sessionAttributes.repromptSpeech = requestAttributes.t('GENERAL_INFORMATION_ABOUT_INTERNSHIPS_REPROMPT');

    return handlerInput.responseBuilder
      .speak(sessionAttributes.speakOutput)
      .reprompt(sessionAttributes.repromptSpeech)
      .getResponse();
  }
}

/**
 * Handles CaptureAttributesIntent requests sent by Alexa
 */
const CaptureAttributesIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'CaptureAttributesIntent';
  },
  async handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes() || {};
    const slots = handlerInput.requestEnvelope.request.intent.slots
    const major = slots.major.resolutions.resolutionsPerAuthority[0].values[0].value.id
    let gpa = slots.gpa.value
    let grad_year = slots.grad_year.value
    const math_skills = slots.math_skills.resolutions.resolutionsPerAuthority[0].values[0].value.id === 'YES' ? true : false
    const cs_skills = slots.cs_skills.resolutions.resolutionsPerAuthority[0].values[0].value.id === 'YES' ? true : false
    const management_skills = slots.management_skills.resolutions.resolutionsPerAuthority[0].values[0].value.id === 'YES' ? true : false
    const pc_skills = slots.pc_skills.resolutions.resolutionsPerAuthority[0].values[0].value.id === 'YES' ? true : false
    const analysis_skills = slots.analysis_skills.resolutions.resolutionsPerAuthority[0].values[0].value.id === 'YES' ? true : false
    const datascience_skills = slots.datascience_skills.resolutions.resolutionsPerAuthority[0].values[0].value.id === 'YES' ? true : false

    if (parseInt(gpa) / 10 != 0) {
      gpa = `${gpa.substring(0, 1)}.${gpa.substring(1)}`;
    } else {
      gpa = `${gpa.substring(0, 1)}.0`;
    }

    gpa = parseFloat(gpa);
    grad_year = parseInt(grad_year)

    await handlerInput.attributesManager.setPersistentAttributes({
      major,
      gpa,
      grad_year,
      math_skills,
      cs_skills,
      management_skills,
      pc_skills,
      analysis_skills,
      datascience_skills
    })
    await handlerInput.attributesManager.savePersistentAttributes();

    sessionAttributes.speakOutput = requestAttributes.t('SAVED_PROFILE');
    sessionAttributes.repromptSpeech = requestAttributes.t('SAVED_PROFILE_REPROMPT');
    // sessionAttributes.checkYesForSearchOverride = true;

    return handlerInput.responseBuilder
      .speak(sessionAttributes.speakOutput)
      .reprompt(sessionAttributes.repromptSpeech)
      .getResponse();
  }
}

/**
 * Handles AMAZON.HelpIntent requests sent by Alexa
 */
const HelpHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    sessionAttributes.speakOutput = requestAttributes.t('HELP_MESSAGE');
    sessionAttributes.repromptSpeech = requestAttributes.t('HELP_REPROMPT');

    return handlerInput.responseBuilder
      .speak(sessionAttributes.speakOutput)
      .reprompt(sessionAttributes.repromptSpeech)
      .getResponse();
  },
};


/**
 * Handles AMAZON.RepeatIntent requests sent by Alexa
 * Prompt and reprompt will be taken from session attributes
 */
const RepeatHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    return handlerInput.responseBuilder
      .speak(sessionAttributes.speakOutput)
      .reprompt(sessionAttributes.repromptSpeech)
      .getResponse();
  },
};

/**
 * Handles AMAZON.StopIntent and AMAZON.CancelIntent requests sent by Alexa
 */
const ExitHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speakOutput = requestAttributes.t('STOP_MESSAGE', requestAttributes.t('SKILL_NAME'));

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    console.log('Inside SessionEndedRequestHandler');
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${JSON.stringify(handlerInput.requestEnvelope)} `);
    return handlerInput.responseBuilder.getResponse();
  },
};

/**
 * Error Handler
 * handles all errors that exist
 */
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error} `);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

/**
 * Localization Interceptor
 * Add i18n translation client to the attributes manager
 */
const LocalizationInterceptor = {
  process(handlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: handlerInput.requestEnvelope.request.locale,
      overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
      resources: translations,
      returnObjects: true,
    });

    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function (...args) {
      return localizationClient.t(...args);
    };
  },
};

/**
 * This request interceptor will log all incoming requests in the associated Logs (CloudWatch) of the AWS Lambda functions
 */
const LoggingRequestInterceptor = {
  process(handlerInput) {
    console.log(`Incoming request: ${JSON.stringify(handlerInput.requestEnvelope)} `);
  }
};

/**
* This response interceptor will log all outgoing responses in the associated Logs (CloudWatch) of the AWS Lambda functions
*/
const LoggingResponseInterceptor = {
  process(handlerInput, response) {
    console.log(`Outgoing response: ${JSON.stringify(response)} `);
  }
};


//Load the target user's profile and store it into session attr
const LoadProfileInterceptor = {
  async process(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = await attributesManager.getPersistentAttributes() || {};
    console.log("load interceptor session attr");
    console.log(JSON.stringify(sessionAttributes));
    const major = sessionAttributes.hasOwnProperty('major') ? sessionAttributes.major : undefined;
    const gpa = sessionAttributes.hasOwnProperty('gpa') ? sessionAttributes.gpa : undefined;
    const grad_year = sessionAttributes.hasOwnProperty('grad_year') ? sessionAttributes.grad_year : undefined;
    const math_skills = sessionAttributes.hasOwnProperty('math_skills') ? sessionAttributes.math_skills : undefined;
    const cs_skills = sessionAttributes.hasOwnProperty('cs_skills') ? sessionAttributes.cs_skills : undefined;
    const management_skills = sessionAttributes.hasOwnProperty('management_skills') ? sessionAttributes.management_skills : undefined;
    const pc_skills = sessionAttributes.hasOwnProperty('pc_skills') ? sessionAttributes.pc_skills : undefined;
    const analysis_skills = sessionAttributes.hasOwnProperty('analysis_skills') ? sessionAttributes.analysis_skills : undefined;
    const datascience_skills = sessionAttributes.hasOwnProperty('datascience_skills') ? sessionAttributes.datascience_skills : undefined;

    if (major != undefined && gpa != undefined && grad_year != undefined && math_skills != undefined && cs_skills != undefined && management_skills != undefined && pc_skills != undefined && analysis_skills != undefined && datascience_skills != undefined) {
      await attributesManager.setSessionAttributes(sessionAttributes)
    }
  }
}


function findFromProfile(user) {
  let perfectMatch = []
  let closeMatch = []
  for (let i = 0; i < jobs.length; i++) {
    if (jobs[i].qualifications.min_gpa > user.gpa) {
      continue
    }

    let gradMatch = false
    grad_loop:
    for (let j = 0; j < jobs[i].qualifications.target_grad_year.length; j++) {
      if (jobs[i].qualifications.target_grad_year[j] == user.grad_year) {
        gradMatch = true
        break grad_loop
      }
    }

    if (!gradMatch) {
      continue
    }

    let majorMatch = false
    major_loop:
    for (let j = 0; j < jobs[i].qualifications.target_grad_year.length; j++) {
      if (jobs[i].qualifications.target_majors[j] === user.major) {
        majorMatch = true
        break major_loop
      }
    }

    if (!majorMatch) {
      continue;
    }

    let counter = 0
    if (jobs[i].qualifications.requires_math_skills) {
      if (!user.math_skills) counter++
    }

    if (jobs[i].qualifications.requires_cs_skills) {
      if (!user.cs_skills) counter++
    }

    if (jobs[i].qualifications.requires_management_skills) {
      if (!user.management_skills) counter++
    }

    if (jobs[i].qualifications.requires_pc_skills) {
      if (!user.pc_skills) counter++
    }

    if (jobs[i].qualifications.requires_analysis_skills) {
      if (!user.analysis_skills) counter++
    }

    if (jobs[i].qualifications.requires_datascience_skills) {
      if (!user.datascience_skills) counter++
    }

    if (counter == 0) {
      perfectMatch.push(jobs[i])
      continue
    }

    if (counter <= 2) {
      closeMatch.push(jobs[i])
    }
  }

  return {
    perfectMatch,
    closeMatch
  }
}

/* LAMBDA SETUP */
const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
  .withPersistenceAdapter(
    new persistenceAdapter.S3PersistenceAdapter({ bucketName: 'skill-prudential-intership-recommendation' })
  )
  .addRequestHandlers(
    LaunchRequestHandlerWithProfile,
    LaunchRequestHandlerNoProfile,
    GeneralInformationIntentHandler,
    GeneralInternshipInformationIntent,
    CaptureAttributesIntentHandler,
    KeywordScanIntent,
    ScanIntentHandler,
    HelpHandler,
    RepeatHandler,
    ExitHandler,
    SessionEndedRequestHandler,
)
  .addRequestInterceptors(LoggingRequestInterceptor, LocalizationInterceptor, LoadProfileInterceptor)
  .addResponseInterceptors(LoggingResponseInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();


jobs = [
  {
    "category": "OPERATIONS",
    "job_code": "TA 0001Y",
    "job_title": "2020 Investment Operations Internship: PGIM",
    "job_type": "INTERNSHIP",
    "location_city": [
      "NEWARK"
    ],
    "location_state": [
      "NEW JERSEY"
    ],
    "impact": "Are you looking for a career that helps you apply your love of data, financial analysis, and investments to facilitate business strategy and work with diverse teams on challenging projects? Are you passionate about being a part of an exciting internship program that is focused on developing technical and professional skills while collaborating alongside leaders in the asset management community? If you are results driven, have a real passion for working with financial data, are deeply analytical and highly creative, then Prudential’s PGIM Investment Operations Internship Program is the place for you! PGIM Investment Operations and Systems provides the operations and technology support that contributes to PGIM being a world-class investment manager. We supply transaction-level support, generate and report investment results and ensure that our investment results are accurately reflected on our books and records.",
    "qualifications": {
      "target_grad_year": [
        2020,
        2021,
        2022
      ],
      "target_majors": [
        "ACT",
        "ECON",
        "FIN"
      ],
      "min_gpa": 3.0,
      "requires_math_skills": false,
      "requires_cs_skills": false,
      "requires_management_skills": false,
      "requires_pc_skills": false,
      "requires_analysis_skills": true,
      "requires_datascience_skills": false
    }
  },
  {
    "category": "TECHNOLOGY",
    "job_code": "TA 0001V",
    "job_title": "2020 Coding/Programming Internship: Prudential",
    "job_type": "INTERNSHIP",
    "location_city": [
      "NEWARK",
      "SHELTON",
      "ROSELAND",
      "JACKSONVILLE",
      "PLYMOUTH",
      "SUNNYVALE"
    ],
    "location_state": [
      "NEW JERSEY",
      "CONNECTICUT",
      "NEW JERSEY",
      "FLORIDA",
      "MINNESOTA",
      "CALIFORNIA"
    ],
    "impact": "Do you aspire to be a world-class programmer? Do you enjoy solving complex challenges and creating unique solutions through your code? As an organization that focuses on both technology and professional development, we encourage aspiring and talented programmers to apply their unique programming skills in our Coding & Software Development Internship.As a Programming Intern, you will be utilizing various programming languages that include (but are not limited to) Java, C++, Python, .Net (VB, C#, ASP), JavaScript, HTML, XML/XSL, SQL, or Batch Scripting. You will collaborate with your peers and our DevOps team in our ongoing efforts to invest in new platforms and capabilities. This internship will challenge you to influence technical direction, develop and review detailed implementation designs, and be accountable for the stability and extendibility of your applications. Your code will be held to a high-standard, and we will seek your knowledge of the latest technologies to enhance how we engage our customer and execute our objectives. Your creativity in solving complex problems will be an asset that every business unit can leverage; thus, providing you with the opportunity to define the career you want to lead. Your projects will support a variety of Finance and Technology initiatives impacting multiple business groups and functions. If you want to apply your knowledge and skills towards an impactful, insightful, and meaningful internship experience, then this is the role for you! We offer highly competitive compensation and housing/transportation stipends if the job requires you to move geographically.",
    "qualifications": {
      "target_grad_year": [
        2020,
        2021,
        2022,
        2023
      ],
      "target_majors": [
        "CS",
        "CE",
        "MATH"
      ],
      "min_gpa": 3.0,
      "requires_math_skills": false,
      "requires_cs_skills": true,
      "requires_management_skills": false,
      "requires_pc_skills": true,
      "requires_analysis_skills": false,
      "requires_datascience_skills": false
    }
  },
  {
    "category": "TECHNOLOGY",
    "job_code": "TA 0001S",
    "job_title": "2020 Information Technology Internship Program: Prudential",
    "job_type": "INTERNSHIP",
    "location_city": [
      "NEWARK",
      "SHELTON",
      "ROSELAND",
      "JACKSONVILLE",
      "PLYMOUTH",
      "DRESHER"
    ],
    "location_state": [
      "NEW JERSEY",
      "CONNECTICUT",
      "NEW JERSEY",
      "FLORIDA",
      "MINNESOTA",
      "PENNSYLVANIA"
    ],
    "impact": "Are you a freshman, sophomore, or junior looking to put your technical skills to use in a business environment? Or maybe you’re looking to gain foundational technical knowledge/skills to apply in a professional environment, while developing strong relationships through training, mentorship, and ongoing feedback. If you have strong analytical skills, are eager to learn, and able to troubleshoot to resolve complex issues utilizing outside-the-box thinking and unique perspectives, then this is the role for you! Many teams across Prudential are dedicated to delivering world-class technology and strategic solutions that help every one of our business units deliver in a competitive global landscape. Our technology internships will leverage the knowledge, skills and abilities that you have obtained through your academic studies to help solve some of our biggest challenges. Your creativity will help us build the world in which we operate, conduct business, and serve our clients across the globe. As an Information Technology Intern, you will collaborate closely with fellow technologists, managers and mentors. You will be tasked with automating existing processes and may be exposed to cloud technology, serverless computing, virtual networking and machine learning. You will be given substantial responsibilities and will have opportunity to present your newly learned skills to your team during this 10-week experience. We offer highly competitive compensation and housing/transportation stipends if the job requires you to move geographically.",
    "qualifications": {
      "target_grad_year": [
        2020,
        2021,
        2022,
        2023
      ],
      "target_majors": [
        "IT",
        "CE",
        "CS",
        "EE",
        "MATH"
      ],
      "min_gpa": 3.0,
      "requires_math_skills": false,
      "requires_cs_skills": true,
      "requires_management_skills": false,
      "requires_pc_skills": true,
      "requires_analysis_skills": false,
      "requires_datascience_skills": false
    }
  },
  {
    "category": "TECHNOLOGY",
    "job_code": "TA 0001U",
    "job_title": "2020 Data Analytics and Business Systems Internship: Prudential",
    "job_type": "INTERNSHIP",
    "location_city": [
      "NEWARK",
      "SHELTON",
      "ROSELAND",
      "PLYMOUTH"
    ],
    "location_state": [
      "NEW JERSEY",
      "CONNECTICUT",
      "NEW JERSEY",
      "MINNESOTA"
    ],
    "impact": "Are you a freshman, sophomore, or junior looking to put your data analytics skills to use in a business setting? Are you organized, analytical in nature, and looking to thrive in a collaborative/dynamic work environment? Do you want to work with experienced professionals and subject matter experts to help you develop your technical skillset? If this sounds like you, that’s a challenge we can help you meet as a member of our Data Analytics Internship Program. Data is widely-recognized as a critical enterprise resource in today’s business technology environment. We are looking for top-performing students who excel at analytical problem solving. As a Data Analyst, you will improve business initiatives through operational enhancement while aligning our technical capabilities towards efficient and strategic business solutions. Your work will help us move beyond the numbers—and on to the narrative of what is happening, why it is happening and where things are likely to go in the future. Beyond your day-to-day work, you’ll have the opportunity to provide new perspectives and are excited about Prudential’s culture of giving back to the communities where we live and work. Come join us for an insightful and personalized summer internship experience. As part of our hiring process, we will help match you with the team or business group that is the best fit for your skills and your unique professional goals. We offer highly competitive compensation and housing/transportation stipends if the job requires you to move geographically.",
    "qualifications": {
      "target_grad_year": [
        2020,
        2021,
        2022,
        2023
      ],
      "target_majors": [
        "MIS",
        "BMGT",
        "BAIT",
        "STATS",
        "BANAL"
      ],
      "min_gpa": 3.0,
      "requires_math_skills": false,
      "requires_cs_skills": true,
      "requires_management_skills": false,
      "requires_pc_skills": true,
      "requires_analysis_skills": false,
      "requires_datascience_skills": false
    }
  },
  {
    "category": "TECHNOLOGY",
    "job_code": "TA 0001X",
    "job_title": "2020 Product Managment Internship: Prudential",
    "job_type": "INTERNSHIP",
    "location_city": [
      "SUNNYVALE",
      "NEWARK"
    ],
    "location_state": [
      "CALIFORNIA",
      "NEW JERSEY"
    ],
    "impact": "Are you a highly organized and ambitious student who wants to put your technical and product management skills to use in a business environment? Are you looking to expand your abilities and perspective by working with diverse teams on challenging projects and build relationship with experts/leaders in the field? If you have a passion for Product Management, want to learn & communicate new ideas to a professional audience, and drive challenging projects end-to-end, then this is the internship for you! Our Product Management Program invites financial technology, design, and technical enthusiasts to help build, optimize and deliver platforms for Prudential Financials’ global businesses. Your creativity helps build the world in which we operate, conduct business, and serve our clients across the globe. This role resides in Prudential’s Customer Office, a group building a startup culture in a 140+ year old company that is touching 20 Million+ lives, yet thinks agile. A company where talent drives success and your work touches everyone, from a 25-year old to folks over 90 years old living in retirement. We care about web accessibility. We care how we treat our customers. Our employees are passionate about what they do and make it happen. We offer highly competitive compensation and housing/transportation stipends if the job requires you to move geographically.",
    "qualifications": {
      "target_grad_year": [
        2020,
        2021,
        2022,
        2023
      ],
      "target_majors": [
        "FIN",
        "CE",
        "MATH",
        "IT"
      ],
      "min_gpa": 3.0,
      "requires_math_skills": false,
      "requires_cs_skills": false,
      "requires_management_skills": true,
      "requires_pc_skills": true,
      "requires_analysis_skills": true,
      "requires_datascience_skills": false
    }
  },
  {
    "category": "TECHNOLOGY",
    "job_code": "TA 00020",
    "job_title": "2020 Coding/Programming Associate: Prudential",
    "job_type": "FULL_TIME",
    "location_city": [
      "NEWARK"
    ],
    "location_state": [
      "NEW JERSEY"
    ],
    "impact": "Do you aspire to be a world-class programmer? Do you enjoy solving complex challenges and creating unique solutions through your code? As an organization that focuses on both technology and professional development, we encourage aspiring and talented programmers to apply their unique programming skills in our Coding & Software Development Associate Program. As a Programming Associate, you will be utilizing various programming languages that include (but are not limited to) Java, C++, Python, .Net (VB, C#, ASP), JavaScript, HTML, XML/XSL, SQL, or Batch Scripting. You will collaborate with your peers and our DevOps team in our ongoing efforts to invest in new platforms and capabilities. This position will challenge you to influence technical direction, develop and review detailed implementation designs, and be accountable for the stability and extendibility of your applications. Your code will be held to a high-standard, and we will seek your knowledge of the latest technologies to enhance how we engage our customer and execute our objectives. Your creativity in solving complex problems will be an asset that every business unit can leverage; thus, providing you with the opportunity to define the career you want to lead. Your projects will support a variety of Finance and Technology initiatives impacting multiple business groups and functions. If you want to apply your knowledge and skills towards an impactful, insightful, and meaningful experience, then this is the role for you!",
    "qualifications": {
      "target_grad_year": [
        2019,
        2020
      ],
      "target_majors": [
        "CS",
        "CE",
        "MATH"
      ],
      "min_gpa": 3.3,
      "requires_math_skills": false,
      "requires_cs_skills": true,
      "requires_management_skills": false,
      "requires_pc_skills": true,
      "requires_analysis_skills": false,
      "requires_datascience_skills": false
    }
  },
  {
    "category": "TECHNOLOGY",
    "job_code": "TA 00022",
    "job_title": "2020 Infrastructure Systems Development (Mainframe) Internship Program: Prudential",
    "job_type": "INTERNSHIP",
    "location_city": [
      "NEWARK"
    ],
    "location_state": [
      "NEW JERSEY"
    ],
    "impact": "Are you looking to gain foundational technical Mainframe knowledge to apply in a professional environment, while developing strong relationships through training, mentorship, and ongoing feedback? If you have strong analytical skills, are eager to learn, and able to troubleshoot to resolve complex issues utilizing outside-the-box thinking and unique perspectives, then this Mainframe focused role is for you! Our technology internships will leverage the knowledge, skills and abilities that you have obtained through your academic studies to help solve some of our biggest challenges on the Mainframe platform. Your creativity will help us build the world in which we operate, conduct business, and serve our clients across the globe. As an Infrastructure Systems Development Intern, you will work closely with senior developers, managers and mentors. You will be exposed to various components of systems development lifecycle (SDLC), as well as systems concepts including administration of file systems spanning various operating systems, utilization of sophisticated and powerful API's, and a deep understanding of Mainframe and UNIX operating system fundamentals. With most Fortune 500 companies using mainframes, “big iron” requires skilled system developers with a firm knowledge of computer science topics ranging from TCP/IP networking, common scripting languages, full stack administration, JAVA to more mainframe focused programming languages such as Job Control Language (JCL) and Restructured Extended Executor (REXX). While learning on one of the most powerful and reliable platforms in enterprise architecture, you will be shown the strategies, hardware, and software supporting the enterprises on forefront of technology and business since 1951. We offer highly competitive compensation and housing/transportation stipends if the job requires you to move geographically.",
    "qualifications": {
      "target_grad_year": [
        2020,
        2021,
        2022,
        2023
      ],
      "target_majors": [
        "CS",
        "CE",
        "MATH",
        "IT"
      ],
      "min_gpa": 3.0,
      "requires_math_skills": false,
      "requires_cs_skills": true,
      "requires_management_skills": false,
      "requires_pc_skills": true,
      "requires_analysis_skills": false,
      "requires_datascience_skills": false
    }
  },
  {
    "category": "SALES",
    "job_code": "ISG0003D",
    "job_title": "2020 Individual Life Insurance Service Experience Internship: Prudential",
    "job_type": "INTERNSHIP",
    "location_city": [
      "JACKSONVILLE"
    ],
    "location_state": [
      "FLORIDA"
    ],
    "impact": "Do you have the drive to achieve above and beyond expectations and a passion to help people? Are you highly motivated, analytical, and looking to thrive in a fast-paced environment? If you have the desire and vision to think creatively and are results driven, then the Service Experience internship on the Individual Life Insurance team is for you! During the 10-week internship, you will have the opportunity to rotate within the following 3 functions of Individual Life Insurance: Customer Value Center: optimizes the profitability of Prudential’s inforce life insurance policies and cultivates customer advocates through targeted customer retention and client-initiated sales. New Business Case Management: supports distribution partners in selling Life Insurance through case coordination, relationship-based service, and process education. Compensation Operations: administers compensation programs for Prudential Advisors and maintains all producer information to ensure timely and accurate payments bi-weekly.",
    "qualifications": {
      "target_grad_year": [
        2020,
        2021,
        2022
      ],
      "target_majors": [
        "ALL"
      ],
      "min_gpa": 3.0,
      "requires_math_skills": false,
      "requires_cs_skills": false,
      "requires_management_skills": true,
      "requires_pc_skills": true,
      "requires_analysis_skills": true,
      "requires_datascience_skills": false
    }
  },
  {
    "category": "SALES",
    "job_code": "NSD000AP",
    "job_title": "2020 Individual Solutions Group (ISG) Sales Internship",
    "job_type": "INTERNSHIP",
    "location_city": [
      "PLYMOUTH",
      "DRESHER",
      "SHELTON"
    ],
    "location_state": [
      "MINNESOTA",
      "PENNSYLVANIA",
      "CONNECTICUT"
    ],
    "impact": "Are you looking for a career that utilizes your ability to solve for complex challenges, uncover opportunities to drive value and work with diverse teams on challenging projects? Are you interested in being a part of an exciting internship experience that is focused on developing technical and leadership skills while collaborating alongside leaders in the Prudential community? If you are an innovative, entrepreneurial thinker, looking to expand your financial knowledge and have a passion for closing business deals then a Sales Internship as part of the Individuals Solutions Group is for you! Individual Solutions provides financial advice and develops, distributes and services annuities, life insurance and other outcome-oriented solutions for consumers. The group is comprised of Prudential Annuities, Prudential Individual Life Insurance and Prudential Advisors. The Individual Solutions Sales Intern will work in the Annuities or Individual Life Insurance business.",
    "qualifications": {
      "target_grad_year": [
        2020,
        2021
      ],
      "target_majors": [
        "ECON",
        "FIN"
      ],
      "min_gpa": 3.2,
      "requires_math_skills": false,
      "requires_cs_skills": false,
      "requires_management_skills": false,
      "requires_pc_skills": false,
      "requires_analysis_skills": true,
      "requires_datascience_skills": false
    }
  },
  {
    "category": "ACTUARIAL",
    "job_code": "ACT000RC",
    "job_title": "2020 Actuarial Success Awareness Program (ASAP): Prudential",
    "job_type": "EXTERNSHIP",
    "location_city": [
      "NEWARK"
    ],
    "location_state": [
      "NEW JERSEY"
    ],
    "impact": "Are you a freshman or sophomore student majoring in actuarial science, mathematics, or statistics looking to diversify your skillset, learn more about the insurance & financial services industry, and open several career doors along the way? Are you interested in being a part of an exciting development program that is focused on professional skills training, working with diverse teams on exciting projects, and building relationships with leaders in the actuarial community? Then Prudential’s Actuarial Success Awareness Program (ASAP) is the place for you! The Actuarial Success Awareness Program (ASAP) is a 1-week experience that takes place in May 2020 and is designed to expose strong mathematics students to a career in the Actuarial profession. The program is open to freshmen and sophomore students from all backgrounds.",
    "qualifications": {
      "target_grad_year": [
        2021,
        2022,
        2023
      ],
      "target_majors": [
        "AS",
        "MATH",
        "STATS",
        "CS"
      ],
      "min_gpa": 3.2,
      "requires_math_skills": true,
      "requires_cs_skills": true,
      "requires_management_skills": false,
      "requires_pc_skills": true,
      "requires_analysis_skills": false,
      "requires_datascience_skills": false
    }
  },
  {
    "category": "ASSET_MANAGEMENT",
    "job_code": "INV000F6",
    "job_title": "2020 Strategic Investment Research Internship Program: PGIM",
    "job_type": "INTERNSHIP",
    "location_city": [
      "NEWARK"
    ],
    "location_state": [
      "NEW JERSEY"
    ],
    "impact": "Are you looking for a career that helps you apply your love of finance, research, and asset management to strengthen business strategy and work with diverse teams on challenging projects? Are you passionate about being a part of an exciting internship program that is focused on developing technical and professional skills while collaborating alongside leaders in the Investment community? If you are results driven, have a real passion for working with data, and are a strong communicator and highly creative, then PGIM Investments is the place for you! The Strategic Investment Research Group (SIRG) within PGIM Investments, is a group of highly trained experts, and specialized analysts who devote their full attention to knowing and understanding the players in the global money management community. SIRG was founded over 30 years ago to serve Prudential Financials’ wealth management divisions. Today SIRG provides services to a wide range of Prudential Financials’ businesses, ranging from basic research and reporting to full-service platform consulting and discretionary multi-manager portfolio management.",
    "qualifications": {
      "target_grad_year": [
        2021,
        2022
      ],
      "target_majors": [
        "FIN",
        "ECON",
        "ACT"
      ],
      "min_gpa": 3.0,
      "requires_math_skills": false,
      "requires_cs_skills": false,
      "requires_management_skills": false,
      "requires_pc_skills": true,
      "requires_analysis_skills": true,
      "requires_datascience_skills": false
    }
  },
  {
    "category": "ASSET_MANAGEMENT",
    "job_code": "PCG0007K",
    "job_title": "2020 Summer Investment Analyst: Prudential Private Capital (PPC)",
    "job_type": "INTERNSHIP",
    "location_city": [
      "CHICACO",
      "LOS ANGELES",
      "ATLANTA",
      "DALLAS",
      "SAN FRANCISCO",
      "NEW YORK"
    ],
    "location_state": [
      "ILLINOIS",
      "CALIFORNIA",
      "GEORGIA",
      "TEXAS",
      "NEW YORK"
    ],
    "impact": "Are you a rising junior looking to apply your analytical knowledge and make an impact within a dynamic, evolving organization? Or maybe you’re looking to gain foundational knowledge and skills to apply in a professional environment, while developing strong relationships through training, mentorship, and ongoing feedback. At Prudential Private Capital that’s a challenge we can help you meet as a Summer Investment Analyst. As a Summer Analyst, you would work on a small deal team responsible for underwriting, portfolio monitoring and marketing and contribute analytical and written content as part of the investment process over your 10-week summer internship. You will learn about investing private placements of senior debt, subordinated debt, and equity capital, gaining valuable experience in thinking like a long-term investor, as well as applying accounting and finance fundamentals. You will also participate in an eight-week, in-house training program throughout the internship.",
    "qualifications": {
      "target_grad_year": [
        2021
      ],
      "target_majors": [
        "ALL"
      ],
      "min_gpa": 3.0,
      "requires_math_skills": false,
      "requires_cs_skills": false,
      "requires_management_skills": false,
      "requires_pc_skills": false,
      "requires_analysis_skills": false,
      "requires_datascience_skills": false
    }
  },
  {
    "category": "ASSET_MANAGEMENT",
    "job_code": "PCG0007N",
    "job_title": "2020 Investment Analyst: Prudential Private Capital (PPC)",
    "job_type": "FULL_TIME",
    "location_city": [
      "CHICACO",
      "LOS ANGELES",
      "ATLANTA",
      "DALLAS",
      "SAN FRANCISCO",
      "NEW YORK"
    ],
    "location_state": [
      "ILLINOIS",
      "CALIFORNIA",
      "GEORGIA",
      "TEXAS",
      "NEW YORK"
    ],
    "impact": "Are you a rising senior looking to apply your analytical knowledge and make an impact within a dynamic, evolving organization? Or maybe you’re looking to gain foundational knowledge and skills to apply in a professional environment, while developing strong relationships through training, mentorship, and ongoing feedback. At Prudential Private Capital that’s a challenge we can help you meet as an Investment Analyst. As an Investment Analyst, you would work on a small deal team responsible for underwriting, portfolio monitoring and marketing, while getting the chance to develop your analytical skills and learn to think like a buy-and-hold investor in a three-year analyst program. You will learn about investing private placements of senior debt and junior capital within a variety of industries from large, multi-national companies to smaller, privately-held companies. Many of our analysts move on to attend top business schools and have received a variety of opportunities within the industry at the close of the three-year Investment Analyst program.",
    "qualifications": {
      "target_grad_year": [
        2020
      ],
      "target_majors": [
        "ALL"
      ],
      "min_gpa": 3.0,
      "requires_math_skills": false,
      "requires_cs_skills": false,
      "requires_management_skills": false,
      "requires_pc_skills": false,
      "requires_analysis_skills": true,
      "requires_datascience_skills": false
    }
  },
  {
    "category": "OPERATIONS",
    "job_code": "TA 0001Z",
    "job_title": "2020 Investment Operations Associate: PGIM",
    "job_type": "FULL_TIME",
    "location_city": [
      "NEWARK"
    ],
    "location_state": [
      "NEW JERSEY"
    ],
    "impact": "Are you looking for a career that helps you apply your love of data, financial analysis, and investments to facilitate business strategy and work with diverse teams on challenging projects? Are you passionate about pursuing a full-time Associate role that is focused on developing technical and professional skills while collaborating alongside leaders in the asset management community? If you are results driven, motivated, have a real passion for working with financial data, are deeply analytical and highly creative, then Prudential’s PGIM Investment Operations Associate role is the position for you! PGIM Investment Operations and Systems provides the operations and technology support that contributes to PGIM being a world-class investment manager. We supply transaction-level support, generate and report investment results and ensure that our investment results are accurately reflected on our books and records.",
    "qualifications": {
      "target_grad_year": [
        2019,
        2020
      ],
      "target_majors": [
        "ACT",
        "ECON",
        "FIN"
      ],
      "min_gpa": 3.0,
      "requires_math_skills": false,
      "requires_cs_skills": false,
      "requires_management_skills": false,
      "requires_pc_skills": false,
      "requires_analysis_skills": false,
      "requires_datascience_skills": false
    }
  },
  {
    "category": "OPERATIONS",
    "job_code": "GRO000CB",
    "job_title": "2020 Workplace Solutions Group (WSG)- Group Insurance Health and Productivity Internship: Prudential",
    "job_type": "INTERNSHIP",
    "location_city": [
      "PORTLAND"
    ],
    "location_state": [
      "MAINE"
    ],
    "impact": "Are you looking for a career that helps you apply your energy, curiosity and initiative to help solve some of Prudential’s business challenges? Are you interested in working with diverse teams on projects that add value and have an impact to our business priorities? Are interested in learning how to improve the productivity and health of the workforce? If you are an innovative, self-starter looking to continuously improve things and creatively solve problems, then a Health and Productivity Internship within the Workplace Solutions Group (WSG) is for you. The Health and Productivity Analytics and Consulting practice is housed with WSG group insurance and works with employers to help them maximize productivity and minimize absence through data analysis that leads to actionable solutions. We also perform research on emerging workforce challenges and design projects that identify real time actionable solutions to these challenges.",
    "qualifications": {
      "target_grad_year": [
        2020,
        2021
      ],
      "target_majors": [
        "ALL"
      ],
      "min_gpa": 3.0,
      "requires_math_skills": false,
      "requires_cs_skills": false,
      "requires_management_skills": false,
      "requires_pc_skills": false,
      "requires_analysis_skills": true,
      "requires_datascience_skills": false
    }
  },
  {
    "category": "PROJECT MANAGEMENT",
    "job_code": "TA 0001T",
    "job_title": "2020 Project Management & Business Solutions Internship: Prudential",
    "job_type": "INTERNSHIP",
    "location_city": [
      "NEWARK",
      "ROSELAND"
    ],
    "location_state": [
      "NEW JERSEY"
    ],
    "impact": "Do you aspire to be a Project Manager or Business Solutions Specialist? Do you enjoy solving problems? We are looking for aspiring Project Managers to help solve some of Prudential’s biggest challenges by aligning our technical initiatives towards efficient and strategic business solutions. In this role, your creativity in developing solutions to complex problems will be an asset that every business unit can leverage; thus, providing you with the opportunity to define the career you want to lead. We are looking for highly organized students who are excited about the opportunity to support various business functions in executing goals by managing strategic projects and providing consultative support. You know how to take initiative and probe for further information when solving problems. You can make quick and effective decisions based on your analysis to produce workable solutions towards a range of problems. Our Project Management and Business Solutions interns are a part of the entire process, and they serve as a liaison between business partners and technologists. Your projects will support a variety of Finance and Technology initiatives impacting multiple business groups and functions. If you want to help solve some of Prudential’s biggest challenges by aligning our technical initiatives towards efficient and strategic business solutions, then this is the role for you!",
    "qualifications": {
      "target_grad_year": [
        2020,
        2021,
        2022,
        2023
      ],
      "target_majors": [
        "BMGT",
        "ECON",
        "BANAL",
        "STATS",
        "COMM",
        "MIS"
      ],
      "min_gpa": 3.0,
      "requires_math_skills": false,
      "requires_cs_skills": false,
      "requires_management_skills": false,
      "requires_pc_skills": true,
      "requires_analysis_skills": false,
      "requires_datascience_skills": false
    }
  },
  {
    "category": "SALES",
    "job_code": "CO 00042",
    "job_title": "2020 Customer Office BYCP Sales & Service Internship: Prudential",
    "job_type": "INTERNSHIP",
    "location_city": [
      "PLYMOUTH"
    ],
    "location_state": [
      "MINNESOTA"
    ],
    "impact": "Do you have the drive to achieve above and beyond expectations and a passion to help people? Are you highly motivated, analytical, and looking to thrive in a fast-paced environment? If you have the desire and vision to think creatively and are results driven, then the Customer Office Internship is for you! The Prudential Customer Office team’s mission is to deliver needs-based, human-centric experiences across all customer touchpoints at Prudential. We do this by strategically leveraging marketing, technology, data and intelligent experimentation to serve the needs of customers and offer the right solutions at the right time to meet their life goals.",
    "qualifications": {
      "target_grad_year": [
        2020,
        2021
      ],
      "target_majors": [
        "ALL"
      ],
      "min_gpa": 3.0,
      "requires_math_skills": false,
      "requires_cs_skills": false,
      "requires_management_skills": false,
      "requires_pc_skills": false,
      "requires_analysis_skills": false,
      "requires_datascience_skills": false
    }
  },
  {
    "category": "MARKETING",
    "job_code": "PGI0009T",
    "job_title": "2020 Executive Marketing Summer Analyst: PGIM",
    "job_type": "INTERNSHIP",
    "location_city": [
      "NEWARK"
    ],
    "location_state": [
      "NEW JERSEY"
    ],
    "impact": "We are currently looking for a rising sophomore or junior to join our team as a Summer Intern. As an intern, you will be part of a small, marketing team overseen by the Chief Administrative Officer who reports directly to the President and CEO of PGIM. You will be given high levels of responsibility and asked to engage in complex business/marketing challenges from day one. Throughout the ten-weeks, we will have you working on a wide range of projects that will have a strong impact PGIM’s brand. You may be asked to research global trends, industry awards, global conferences and other financial publications to evaluate PGIM’s position in the business market in comparison to other asset management businesses. These projects will provide you with exposure to PGIM and the asset management industry, and you will begin to develop a broad business marketing toolkit. In addition to conducting research and analysis, you will be responsible for presenting your findings and recommendations to senior management.",
    "qualifications": {
      "target_grad_year": [
        2020,
        2021,
        2022
      ],
      "target_majors": [
        "MKT",
        "COMM"
      ],
      "min_gpa": 3.0,
      "requires_math_skills": false,
      "requires_cs_skills": false,
      "requires_management_skills": false,
      "requires_pc_skills": false,
      "requires_analysis_skills": false,
      "requires_datascience_skills": false
    }
  }
]