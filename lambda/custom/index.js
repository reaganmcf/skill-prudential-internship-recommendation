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

    const major = sessionAttributes.hasOwnProperty('major') ? sessionAttributes.major : undefined;
    const gpa = sessionAttributes.hasOwnProperty('gpa') ? sessionAttributes.gpa : undefined;
    const grad_year = sessionAttributes.hasOwnProperty('grad_year') ? sessionAttributes.grad_year : undefined;
    const math_skills = sessionAttributes.hasOwnProperty('math_skills') ? sessionAttributes.math_skills : undefined;
    const cs_skills = sessionAttributes.hasOwnProperty('cs_skills') ? sessionAttributes.cs_skills : undefined;
    const management_skills = sessionAttributes.hasOwnProperty('management_skills') ? sessionAttributes.management_skills : undefined;
    const pc_skills = sessionAttributes.hasOwnProperty('pc_skills') ? sessionAttributes.pc_skills : undefined;
    const analysis_skills = sessionAttributes.hasOwnProperty('analysis_skills') ? sessionAttributes.analysis_skills : undefined;
    const datascience_skills = sessionAttributes.hasOwnProperty('datascience_skills') ? sessionAttributes.datascience_skills : undefined;

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
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

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
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const slots = handlerInput.requestEnvelope.request.intent
    const major = slots.major.value
    const gpa = slots.gpa.value
    const grad_year = slots.grad_year.value
    const math_skills = slots.math_skills.value
    const cs_skills = slots.cs_skills.value
    const management_skills = slots.management_skills.value
    const pc_skills = slots.pc_skills.value
    const analysis_skills = slots.analysis_skills.value
    const datascience_skills = slots.datascience_skills.value

    attributesManager.setPersistentAttributes({
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
    attributesManager.savePersistentAttributes();

    sessionAttributes.speakOutput = requestAttributes.t('SAVED_PROFILE');
    sessionAttributes.repromptSpeech = '';

    return handlerInput.responseBuilder
      .speak(sessionAttributes.speakOutput)
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
    console.log(`Session ended with reason: ${JSON.stringify(handlerInput.requestEnvelope)}`);
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
    console.log(`Error handled: ${error.message}`);

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
    console.log(`Incoming request: ${JSON.stringify(handlerInput.requestEnvelope)}`);
  }
};

/**
* This response interceptor will log all outgoing responses in the associated Logs (CloudWatch) of the AWS Lambda functions
*/
const LoggingResponseInterceptor = {
  process(handlerInput, response) {
    console.log(`Outgoing response: ${JSON.stringify(response)}`);
  }
};


//Load the target user's profile and store it into session attr
const LoadProfileInterceptor = {
  async process(handlerInput) {
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = await attributesManager.getPersistentAttributes() || {};

    const major = sessionAttributes.hasOwnProperty('major') ? sessionAttributes.major : undefined;
    const gpa = sessionAttributes.hasOwnProperty('gpa') ? sessionAttributes.gpa : undefined;
    const grad_year = sessionAttributes.hasOwnProperty('grad_year') ? sessionAttributes.grad_year : undefined;
    const math_skills = sessionAttributes.hasOwnProperty('math_skills') ? sessionAttributes.math_skills : undefined;
    const cs_skills = sessionAttributes.hasOwnProperty('cs_skills') ? sessionAttributes.cs_skills : undefined;
    const management_skills = sessionAttributes.hasOwnProperty('management_skills') ? sessionAttributes.management_skills : undefined;
    const pc_skills = sessionAttributes.hasOwnProperty('pc_skills') ? sessionAttributes.pc_skills : undefined;
    const analysis_skills = sessionAttributes.hasOwnProperty('analysis_skills') ? sessionAttributes.analysis_skills : undefined;
    const datascience_skills = sessionAttributes.hasOwnProperty('datascience_skills') ? sessionAttributes.datascience_skills : undefined;

    if (major && gpa && grad_year && math_skills && cs_skills && management_skills && pc_skills && analysis_skills && datascience_skills) {
      attributesManager.setSessionAttributes(sessionAttributes)
    }
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
    HelpHandler,
    RepeatHandler,
    ExitHandler,
    SessionEndedRequestHandler,
)
  .addRequestInterceptors(LoggingRequestInterceptor, LocalizationInterceptor, LoadProfileInterceptor)
  .addResponseInterceptors(LoggingResponseInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();
