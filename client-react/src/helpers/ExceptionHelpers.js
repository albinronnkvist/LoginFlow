export const GetUnprocessableEntityMessage = (responseData) => {
  let errorString = [""];
  let responseArray = JSON.parse(responseData);

  responseArray.forEach( function(data) {
    errorString.push(data.errorMessage + ". ") 
    errorString.push(<br/>);
  })

  return errorString;
}