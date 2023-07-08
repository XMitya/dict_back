const phrases = [
  {
    en: {
      id: "5fe9971f-5e0b-4191-a68a-7cd42b9be222",
      value: "hello"
    }
  },{
    en: {
      id: "d636767e-89fe-4c8a-8f85-019107488e1a",
      value: "Olga"
    }
  }
]

const checkResult = [
  {
    en: {
      id: "5fe9971f-5e0b-4191-a68a-7cd42b9be222",
      value: "hello"
    },
    ru: {
      correctPhrases: [{
        id: "d636767e-89fe-4c8a-8f85-019107488e1a",
        value: "привет",
      },{
        id: "d636767e-89fe-4c8a-8f85-019107488e1b",
        value: "дарова",
      }],
      checkResult: {
        enteredValue: "приве",
        success: false,
        tries: 1,
        failures: 1
      }
    }
  },{
    en: {
      id: "d636767e-89fe-4c8a-8f85-019107488e1a",
      value: "Olga"
    },
    ru: {
      correctPhrases: [{
        id: "d636767e-89fe-4c8a-8f85-019107488e1a",
        value: "Ольга",
      }],
      checkResult: {
        enteredValue: "Ольга",
        success: true,
        tries: 1,
        failures: 0
      }
    }
  }
]

const mocks = {
  phrases: phrases,
  checkResult: checkResult
}

exports.mocks = mocks