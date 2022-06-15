using LoginFlow.Exceptions.UnprocessableEntity;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Newtonsoft.Json;

namespace LoginFlow.Helpers.ErrorHelpers
{
    public static class ThrowUnproccesableEntityExceptionHelper
    {
        public static void ThrowException(ModelStateDictionary modelState)
        {
            var errors = modelState.Keys
                    .Where(k => modelState[k].Errors.Count > 0)
                    .Select(k => new { propertyName = k, errorMessage = modelState[k].Errors[0].ErrorMessage });

            var json = JsonConvert.SerializeObject(errors);

            var ex = new GenericUnprocessableEntityException("Felaktiga värden");
            ex.Data.Add("errors", json);
            throw ex;
        }
    }
}
