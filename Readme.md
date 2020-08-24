# Workshop - Build a realtime fleet tracking system using OpenShift and Here Technologies Location Services

Fleet Management is a core use case for HERE Technologies. Pair that with OpenShift and Kafka real time data processing capabilities and you get real time information about your fleet. In this workshop we will walk you through the simple process of deploying your own management website. You will set up a virtual fleet of vehicles driving around Chicago. Finally, we will also show you how to insert real-time vehicle parameters to track the health of the vehicles.

## Architecture

See the diagram below for an overview of the complete architecture.

![Arch Diagram](./readme-images/arch-diagram.png)

There are 3 main piece of services at work here. 

1. WebApp 
2. Consumer
3. Producer

We have 3 other parts that make this all come together.

1. Here Telemetry
2. Kafka Message Queue
3. MongoDB

