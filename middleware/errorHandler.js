export default function errorHandler(e, req, res, next) {
    console.log(e, e.name)
    if (e.name === 'CastError') {
      // ! 400 -> bad request
      res.status(400).send({ message: "Hey, the ID you provided was not valid. Please provide a valid ID!" })
    } else if (e.name === 'SyntaxError') {
      // ! 422 -> unprocessible entity
      res.status(422).send({ message: "Invalid JSON in your request body." })
    } else if (e.name === 'ValidationError') {
      const customError = {}
      for (const key in e.errors) {
        customError[key] = e.errors[key].message
      }
      // ! 422 -> unprocessible entity
      res.status(422).send({ errors: customError, message: "There are issues with the data you posted." })
    } else {
      // ! 422 -> internal server error
      res.status(500).send({ message: "Something went wrong. Please check your request and try again!" })
    }
  }