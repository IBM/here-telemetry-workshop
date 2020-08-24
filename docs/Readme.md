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

