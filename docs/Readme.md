# Fleet Dashboard Telemetry with Here and OpenShift

In this code pattern, we build a realtime fleet telemetry with Here Location services and OpenShift. We will use open source technologies like NodeJS, Kafka and MongoDB to bring this all together.

## Introduction

Fleet Management is a core use case for HERE Technologies. Pair that with OpenShift and Kafka real time data processing capabilities and you get real time information about your fleet. In this workshop we will walk you through the simple process of deploying your own management website. You will set up a virtual fleet of vehicles driving around Chicago. Finally, we will also show you how to insert real-time vehicle parameters to track the health of the vehicles.

## Included Components

* IBM Managed Openshift
* Here Location Services
* Strimzi Operator (Kafka)
* MongoDB for Openshift
* NodeJS

## Prerequisites

1. Log in, or create an account on IBM Cloud
2. Provision / Access an Openshit 4.3+ cluster

## Architecture

The following diagram shows the architecture of the fleet dash board application, which includes 3 microservices handling different part of the data processing. 

![Architecture Diagram](../readme-images/arch-diagram.png)

1. Producer generates the data using Here Location Services API and write to Kafka. 
2. consumer read that message, process the data and write to MondoDB. 
3. Finally the web app presents that data to the user in map and charts.

## Step 1: Create or Login to IBM Cloud Account

[Signup for IBM Cloud](https://cloud.ibm.com/registration)

Or

[Login to IBM Cloud](https://cloud.ibm.com/login)

## Step 2: Create or Login to Here Developer Portal

[Signup for Here](https://developer.here.com/sign-up)

With here you get a Freemium account that gives you access to here services for free with a limit. 

> As of writing this document (August, 2020) the limit on the free account was more than enough for the application we are building. Please refer to the latest document on [Here](developer.here.com) for current limit.

## Step 3: Create a Here Javascript Project

1. In your Here Developer account. Navigate to list of projects. (For a freemium account you should only have one)

![Here Projects](../readme-images/here-projects.png)

2. Click on Generate App under `JAVASCRIPT`.

![Generate App](../readme-images/here-create-js-app.png)

3. You will see you APP ID. This information is used by some here services. Treat it like secrets. In the newer Here services however the API key is used. So we will need to create one. Click on create API Key.

![Craete Api Key](../readme-images/here-create-api-key.png)

4. You can have upto 2 API keys in the freemium account. We will need only one so this is not an issue. Save this API key for future use. You can always come back here and get access to this key.

![Save Api Key](../readme-images/here-save-api-key.png)

## Step 4: Access your Openshift Cluster

Access your cluster from your dashboard. 

> If this is a guided workshop, your instructor will have most up-to-date documentation on accessing you cluster. 

1. Go to list of clusters

![IBM Cloud Dashboard](../readme-images/ibmcloud-dashboard.png)

2. Select your cluster

![Select Cluster](../readme-images/ibmcloud-select-cluster.png)

3. Access OpenShift Console

![OpenShift Dashboard](../readme-images/ibmcloud-openshift-dashboard.png)

> You might need to allow your browser to open pop up.

We will be doing the next few steps in the OpenShift Console.

![First Page](../readme-images/first-page.png)

## Step 5: Create Project

Project is OpenShifts way to isolate workload and allow for multitenency. All our workload needs to run in a Project.

1. Click On Project at the Top

![Craete Project](../readme-images/create-project.png)

2. Lets create a project named `here-metrics`

![Create Project](../readme-images/create-project-modal.png)

## Step 6: Deploy MongoDB

1. From Project Topology Select `From Catalog`

![Select Catalog](../readme-images/select-catalog.png)

> If we had something else running in this project, we would have to first click `+Add` to access this page.

2. Under Databases find `MongoDB Ephemeral`

![Select Mongo](../readme-images/select-mongo-ephemeral.png)

> The main difference between MongoDB and MongoDB Ephemeral is that one is backed by persistent volume claim (PVC) and the ephemeral is not. In our application we do not need the persistence because we just want to show a live view of our fleet.

3. Click on Instantiate Mongo

![](../readme-images/instantiate-mongo.png)

4. Configure MongoDB and click `Create`

![](../readme-images/mongo-config.png)

> The settings are not production ready. We would want to have tighter security for a production deployment. We can get away with it here because a. this is a demo and b. We wont expose this DB outside the cluster.

5. After some time (Typically 30s to 1min) we should be able to see the mongo deployment.

![](../readme-images/mongo-deployment-complete.png)

## Step 7: Deploy Kafka

1. Move to Adminstrator tab in the console.

![](../readme-images/move-to-administrator.png)

2. Go to `Operators > OperatorHub`. Search for `strimzi`. Click on `Strimzi`

![](../readme-images/search-strimzi.png)

[Strimzi](https://strimzi.io) is an Operator that manages the install lifecycle of Kafka on Kubernetes.

3. Instal Strimzi

![](../readme-images/install-strimzi.png)

4. Confirm installation of Community Operator. 

![](../readme-images/continue-community-install.png)

> Community Operators are operators that are made and maintained by the Operator Community. OpenShift does not provide any gurantee or support for it. 

5. Subscibe to the operator for the `here-metrics` namespace.

![](../readme-images/install-for-namespace.png)

6. After a moment we should be able to see `Strimzi` in our installed operator list. Click on `Strimzi`

![](../readme-images/strimzi-install-complete.png)

7. Click on create Kafka Instance

![](../readme-images/create-kafka-instance.png)

8. Lets name our instance `kafka-cluster` and change the storage to `ephemeral`. And click `Create`

![](../readme-images/modify-kafka-yaml.png)

9. Go to `Workloads > Pods` and after some time we should see 6 new pods. 3 kafka broker and 3 zookeeper instance. 

![](../readme-images/kafka-running.png)

With that our kafka installation is complete.

Lets move back to developer view for the next steps

![](../readme-images/move-to-developer.png)

## Step 8: Deploy Webapp

1. Click on `+Add` and then Select `From Dockerfile`

![](../readme-images/deploy-from-git-with-dockerfile.png)

We will use the dockerfile we have for our application and openshift will build the container and push it to a local registry. This is a great feature of OpenShift that allows us to have the image local to the cluster.

2.  For our Git Repo URL use. 

```
https://github.com/IBM/here-telemetry-workshop
```

If you made a fork of the project. You can use that too. Click on `Show Advance Git Options` and change the `Context Dir` to `/app`. We need to do this because the `Dockerfile` for our consumer service lives in the `/app` path relative to the git root.

For the `Dockerfile` section set the `Container Port` to `3000`.

In General set Application name to `here` and name to `webapp`. Application is a way to group different services together. We will group services created by us into a single group like this. 

Set Resources to `Deployment Config`.

In Advanced Options check `Create route`

Click on routes, deployment and build configuration in the bottom of the page right above the `Create` button.

In Routing security check secure route. If you are trying this on a openshift cluster not managed by IBM keep this unchecked. All IBM OpenShift clusters come pre configured with a TLS certificate for your application routes. For `TLS termination` select `Edge` and for `Insecure Traffic` select `Redirect`.

For deployment we need 2 environmental variables.

`MONGO_CONNECTION_URL`
```
mongodb://admin:admin@mongodb:27017
```

`HERE_API_KEY`
```
<YOUR_HERE_API_KEY>
```

![](../readme-images/console-openshift-console.png)

3. Go to `Builds` and then select `webapp` 

![](../readme-images/check-build-webapp.png)

4. Under `Builds` tab select `webapp-1`

![](../readme-images/webapp-build-logs.png)

5. Go to `Logs` to see the build log. After some time you should see the build is complete.

![](../readme-images/webapp-build-logs.png)


## Step 9: Deploy Consumer

1. Click on `+Add` and then Select `From Dockerfile`

![](../readme-images/deploy-from-git-with-dockerfile.png)

We will use the dockerfile we have for our application and openshift will build the container and push it to a local registry. This is a great feature of OpenShift that allows us to have the image local to the cluster.

2. For our Git Repo URL use. If you made a fork of the project. You can use that too. Click on `Show Advance Git Options` and change the `Context Dir` to `/consumer`. We need to do this because the `Dockerfile` for our consumer service lives in the `/consumer` path relative to the git root.

```
https://github.com/IBM/here-telemetry-workshop
```

![](../readme-images/consumer-dc.png)

3. Giv the Application Name `here` and Name `consumer`. For the resource type select `Deployment Config`. Deployment config is very much like a regular kubernetes deployment with a few extra features unique to OpenShift. And uncheck the create route to the application. Since this is an internal service, we do not want to have a route to it.

![](../readme-images/consumer-dc-2.png)

4. For the Deployment configuration set the following environmental variables.

> You might not see this options. Scroll to the bottom of the page and right above `Create` you can click deployment to make this options available.

`KAFKA_BROKERS` 
```
kafka-cluster-kafka-0.kafka-cluster-kafka-brokers,kafka-cluster-kafka-1.kafka-cluster-kafka-brokers,kafka-cluster-kafka-2.kafka-cluster-kafka-brokers
```

`MONGO_CONNECTION_URL`
```
mongodb://admin:admin@mongodb:27017
```

Select all the options as shown in the image below and click `Create`

> This variables correspond to the services we deployed in previous steps. If you changed the values from the default change these variables accordingly

![](../readme-images/consumer-dc-3.png)

5. Go to the build tab and select `consumer`

![](../readme-images/check-consumer-build.png)

6. Check logs to see the build. This might take a moment. But eventually you will see the image was build and successfully pushed.

![](../readme-images/check-consumer-build-logs.png)


## Step 10: Deploy Producer:

1. Our consumer won't actually do anything until the producer is deployed. Follow the same steps as the consumer to add another application `From Dockerfile`. Set the url of the repo and set the context dir as `/producer`

![](../readme-images/producer-dc-1.png)

2. Give the Application Name `here` and Name `producer`, select `Deployment Config`. For deployment configureation, set the following environmental variables.

`KAFKA_BROKERS` 
```
kafka-cluster-kafka-0.kafka-cluster-kafka-brokers,kafka-cluster-kafka-1.kafka-cluster-kafka-brokers,kafka-cluster-kafka-2.kafka-cluster-kafka-brokers
```

`HERE_API_KEY`
```
<YOUR_HERE_API_KEY>
```

Uncheck create route, and click `Create`

![](../readme-images/producer-dc-2.png)

3. You can check the build log the same way as consumer. By going to `Builds > producer > Logs`

4. Once the build finishes our producer will start to produce records at an interval. To check the logs, select the producer pod from the Topology view. In the pod go to `Logs` to view logs.

![](../readme-images/check-producer-log.png)

5. We can also check the consumer logs

![](../readme-images/check-consumer-log.png)

![](../readme-images/check-log.png)

