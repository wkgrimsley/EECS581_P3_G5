# Project Architecture

## Team Number

Group number: 5

## Team Members

- Abdulaziz Arab
- Felix Balandran
- Riley Backus
- Jamareon Davis
- John Vitha
- Bill Grimsley

## Project Name

Morning Snapshot

## Project Synopsis

A social media/productivity application designed for organizing and tracking daily activities/tasks.

## Architecture Description

Morning Snapshot is a personalizable daily information application created to give users quick and convenient ways to stay informed about events around the wrold that are important to them. This application will show content in a highly interactive, swipable format inspired by Instagram Stories or Spotify Wrapped, allowing users to quickly switch through their highlights without needing to track down countless different websites or applications to do so. The content could be anything from news reports, sporting game scores, stock information, or anything else that the user could want. The whole point of this is to create an interactive and highly modular application for peoplpe to get all the information they need as soon as they wake up.

At first, this will be implemented using a web server application to give a straightforward first implementation to ensure the functionality itself works. This will help with testing and further development before it moves to a more adaptable application. The architecture will be split into a couple of parts, namely the UI, backend, data collection, and data storage (potentially). This separated construction will allow separate parts to be adapted and improved upon without breaking the infrastructure as a whole.

The frontend of the app will be the user interface that user interact with to get their information. It will be made using React.js and other common web design instruments (HTML, CSS, etc.) as needed. Each individual piece of information (or group of information) will be presented in its own story card for the users to view and switch between by swiping back and forth. These cards will include a concise summary of the topic as well as linking to the full story or source of information for the user to learn even more if they so desire. The frontend will also have a place for the user to select the settings and preferrences that apply most to them to make the app fit their individual needs, such as selecting what kind of content they want and how they want it to be ordered.

The backend will handle all the requests from the frontened, retrieving the content requested and coordinating everything to make it function. This will act between the user interface and the data collection systems (and data storage if that part is practical to add within the time we have). When the user opens the app to get their daily highlts, the backend will retrieve these saved (or reselected if no database is made) preferences and use them to select the appropriate content to collect from the data collection part of the architecture. After retrieving the information, it will send it to the frontend to present it in a clear and easy to view way, giving the user all the relevant information they need.

The data collection part of the architecture will use Python scripts to gather information from a wide variety of external sources. These will either poll public APIs from the sources or scrape the webpage, depending on other functionalities provided by the sources. Each kinds of source will have different collection pollers to work specifically for the form of information they provide, ensuring that the information is received in a clear and effective manner. Data collection being separate from all other parts of this process will ensure that any updates being made to the kind of data being collected or even just adding more forms of data collection will maintain the same functionality no matter what sources are changed, added, or removed, providing contant availability for the application.

If we get to this point, a database will provide even more solidarity for the continued functionality of the application. This database will provide persistent storage for the collected content and more importantly the user preferecnes. The stored content could be any of the assorted data from the data collection segment of the architecture. This will make it easier to add to the frontend, as it will be stored instead of having to be reaccessed every time. The user preferences will be stored to prevent the user from having to reenter the things they want to see every time they open the app. This will make the app a lot smoother to use and a lot more effective in providing the needed information every single morning.

This application is strucutred to emphasize an Agile style development, allowing for different features to be added to a core functionality as the requirements change. Initially, the most important functionality is setting up the UI, backend, and first data collection pollers to showcase actual functionality in the program. Beyond that, the modular design will provide for improvements and additions to be implemented seamlessly to the project without hindering the performance of other parts of the application.

Finally, Morning Snapshot is intented to support future expansion beyond the basic web server implementation. A more advanced appliation would allow users to store the information on their phone or computer directly without having to open a browser. This would be shown in the form of a phone or computer app beyond the limitations of a website that is initially planned. Extending this functionality to storing the application on each user's phone will make it even easier than before to access all the data they are requesting without having to go to countless external sources to get the information they need every single morning.
