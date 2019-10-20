const Alexa = require('ask-sdk-core');

const APLDocs = {
  launch: require('./documents/fancycard.json'),
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
      document: APLDocs.launch,
      datasources: generateLaunchScreenDatasource(handlerInput)
    });
  }
}

function keywordSearchScreen(handlerInput) {

}

function scanScreen(handlerInput) {

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

module.exports = {
  launchScreen,
  keywordSearchScreen,
  scanScreen
} 