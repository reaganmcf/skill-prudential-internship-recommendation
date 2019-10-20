/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
const translations = require('./localization')
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

    sessionAttributes.speakOutput = requestAttributes.t('in scan');
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
      perfectMatch.push(jobs[i].job_title)
      continue
    }

    if (counter <= 2) {
      closeMatch.push(jobs[i].job_title)
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
    CaptureAttributesIntentHandler,
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
