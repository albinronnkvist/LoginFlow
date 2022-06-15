/*
 *  All AutoMapper profiles.
 */
using AutoMapper;
using LoginFlow.DTOs.Customer;
using LoginFlow.DTOs.User;

using LoginFlow.Models;

namespace LoginFlow
{
    public class Profiles : Profile
    {
        public Profiles()
        {
            // Source -> Destination
            CreateMap<RegisterUserDto, User>();
            CreateMap<User, GetUserDto>();
            CreateMap<User, AdminUpdateUserDto>();
            CreateMap<User, AdminUpdateUserDto>().ReverseMap();

            CreateMap<AddCustomerDto, Customer>();
            CreateMap<Customer, GetCustomerDto>();
            CreateMap<PatchCustomerDto, Customer>();
            CreateMap<PatchCustomerDto, Customer>().ReverseMap();
        }
    }
}
