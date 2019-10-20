const Alexa = require('ask-sdk-core');

const APLDocs = {
  fancycard: require('./documents/fancycard.json'),
  fancylist: require('./documents/fancylist.json')
};


function supportsAPL(handlerInput) {
  const supportedInterfaces = Alexa.getSupportedInterfaces(handlerInput.requestEnvelope);
  const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
  return aplInterface !== null && aplInterface !== undefined;
}

function launchScreen(handlerInput) {
  if (supportsAPL(handlerInput)) {
    handlerInput.responseBuilder.addDirective({
      type: 'Alexa.Presentation.APL.RenderDocument',
      version: '1.1',
      document: APLDocs.fancycard,
      datasources: generateLaunchScreenDatasource(handlerInput)
    });
  }
}

function keywordSearchScreen(handlerInput) {
  if (supportsAPL(handlerInput)) {
    handlerInput.responseBuilder.addDirective({
      type: 'Alexa.Presentation.APL.RenderDocument',
      version: '1.1',
      document: APLDocs.fancycard,
      datasources: generateKeywordSearchDatasource(handlerInput)
    });
  }
}

function scanScreen(handlerInput, perfectMatches) {
  if (supportsAPL(handlerInput)) {
    handlerInput.responseBuilder.addDirective({
      type: 'Alexa.Presentation.APL.RenderDocument',
      version: '1.1',
      document: APLDocs.fancylist,
      datasources: generateScanScreenDatasource(handlerInput, perfectMatches)
    });
  }
}

function generateScanScreenDatasource(handlerInput, perfectMatches) {
  //for all matches
  let arr = [];
  perfectMatches.forEach((item, index) => {
    arr.push({
      id: item.job_code,
      primaryText: item.job_title
    })
  });

  // Generate JSON Datasource
  return {
    sauceBossData: {
      headerTitle: `We found ${perfectMatches.length} jobs based on your personal recruitment profile`,
      headerSubtitle: `To view information, tap on the item`,
      headerBackButton: !Alexa.isNewSession(handlerInput.requestEnvelope),
      items: arr
    }
  };
}

function generateLaunchScreenDatasource(handlerInput) {

  // Define Header Title & Hint 
  const headerTitle = "Prudential Job Finder"
  const hintText = 'tell me more about prudential'
  // Generate JSON Datasource
  return {
    sauceBossData: {
      type: 'object',
      properties: {
        headerTitle: headerTitle,
        headerBackButton: !Alexa.isNewSession(handlerInput.requestEnvelope),
        hintText: hintText,
        sauceImg: 'https://skill-prudential-intership-recommendation.s3.amazonaws.com/b3dd47c9438088d82c691ac1cac30e.png',
        sauceText: "To build your personal profile, say create profile or update profile. \n\n To learn more about Prudential, ask to learn more about prudential",
        sauceSsml: `<speak>To build your personal profile, say create profile or update profile. \n\n To learn more about Prudential, ask to learn more about prudential</speak>`
      },
      transformers: [
        {
          inputPath: 'sauceSsml',
          transformer: 'ssmlToSpeech',
          outputName: 'sauceSpeech'
        },
        {
          inputPath: 'hintText',
          transformer: 'textToHint',
        }
      ]
    }
  };
}

function generateKeywordSearchDatasource(handlerInput) {
  const headerTitle = "Prudential Job Finder"
  const hintText = 'create my recruitment profile'
  // Generate JSON Datasource
  return {
    sauceBossData: {
      type: 'object',
      properties: {
        headerTitle: headerTitle,
        headerBackButton: !Alexa.isNewSession(handlerInput.requestEnvelope),
        hintText: hintText,
        sauceImg: 'https://skill-prudential-intership-recommendation.s3.amazonaws.com/b3dd47c9438088d82c691ac1cac30e.png',
        sauceText: "We found some jobs for you! View your SMS sent to your personal device for more information",
        sauceSsml: `<speak>We found some jobs for you! View your SMS sent to your personal device for more information</speak>`
      },
      transformers: [
        {
          inputPath: 'sauceSsml',
          transformer: 'ssmlToSpeech',
          outputName: 'sauceSpeech'
        },
        {
          inputPath: 'hintText',
          transformer: 'textToHint',
        }
      ]
    }
  };
}

module.exports = {
  launchScreen,
  keywordSearchScreen,
  scanScreen
} 