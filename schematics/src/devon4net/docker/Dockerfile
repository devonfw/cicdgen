FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build
WORKDIR /app

# copy csproj and restore as distinct layers
COPY Devon4Net.Application.WebAPI/*.csproj ./Devon4Net.Application.WebAPI/

WORKDIR /app/Devon4Net.Application.WebAPI
RUN dotnet restore

# copy and publish app and libraries
WORKDIR /app
COPY . .
WORKDIR /app/Devon4Net.Application.WebAPI
RUN dotnet publish -r linux-x64 -c Release -o out --self-contained

FROM mcr.microsoft.com/dotnet/core/runtime:3.1 AS runtime
WORKDIR /app
COPY --from=build /app/Devon4Net.Application.WebAPI/out ./

EXPOSE 8082

ENTRYPOINT ["dotnet", "Devon4Net.Application.WebAPI.dll"]