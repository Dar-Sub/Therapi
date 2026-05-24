# Use the official .NET 8 SDK image for building the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory
WORKDIR /app

# Copy the project files
COPY *.csproj ./
RUN dotnet restore

# Copy the rest of the application files
COPY . ./

# Build the application
RUN dotnet publish -c Release -o /out

# Use the .NET 8 runtime image for running the application
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

# Set the working directory in the runtime image
WORKDIR /app

# Copy the published application from the build stage
COPY --from=build /out .


# Set the entry point to the application
ENTRYPOINT ["dotnet", "AiTherapy.dll"]