# Project Summary.
RestroSync is a restaurant management system designed to streamline daily operations, enhance customer experience, and optimize business performance. By integrating table management, order processing, menu control, and sales analytics, RestroSync helps restaurants operate more efficiently while providing valuable insights for data-driven decision-making.

# Running the application
***Note: Make sure 'Docker' application is running in the background before starting step 1 and stays on until you use close the application.***
1. In the terminal, make sure to stay in the parent directory so that you are able to see the following directories if you do 'ls'

![ls pictures](docs/ls.png)

2. Run the following command in the terminal to start the application
   
```{bash}
make up-build
```

3. Go to the following link :
[RestroSync](http://localhost:8017)

# Stopping the application
1. In the terminal, run the following command to stop the application:

***Note: These command will also remove docker container and volumes***

```{bash}
make down-volumes
```

# Running the test

To run the unit and integration tests all together first [stop](https://github.com/hetu2344/comp4350-g07#stopping-the-application) the application first. then the run the following commands

```{bash}
make up-build
make run-all-tests
```

**NOTE**: All of the test are passing and here is the coverage for the [backend]() test. However, you might see the _TCPWRAP_ or _open handle_ error from JEST, which are related to how jest is handle the integration tests.

Run the `make help` command to get the list of command availabe, if you want to run some tests seperately.

# Link to documents
[Vision Statement](docs/Vision_Statement.md#vision-statement)

[Core Feeatures](docs/Core_Features.md#core-features)

[User Stories](docs/User_Stories.md#user-stories)

[Tools and Technologies](docs/Technologies.md#technologies)

[Architecture Diagram](docs/Architecture_Diagrams/Architecture_Diagram_v3.drawio.png)

[Branching and Commiting Strategy](docs/Branching-and-Commiting-strategy.md#branching)

[Test Plan](docs/RestroSync_Test_Plan.pdf)

[Our Contributors](docs/Contributors.md)

[Sequence Diagrams](docs/Sequence%20Diagrams/SequenceDiagrams.md)
