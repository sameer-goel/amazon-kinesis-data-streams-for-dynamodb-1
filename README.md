Building a real-time notification system with Amazon Kinesis Data Streams for Amazon DynamoDB and Amazon Kinesis Data Analytics for Apache Flink
================================================================================================================================================

by Saurabh Shrivastava, Sameer Goel, Pratik Patel

Amazon DynamoDB helps you capture high-velocity data such as clickstream
data to form customized user profiles and Internet of Things (IoT) data
so you can develop insights on sensor activity across various
industries, including smart spaces, connect factories, smart packing,
fitness monitoring, and more. It’s important to store these data points
in a centralized data lake in real time, where it can be transformed,
analyzed, and combined with diverse organizational datasets to derive
meaningful insights and make predictions.

A popular use case in the wind energy sector is to protect wind turbines
from wind speed. As per [National Wind
Watch](https://www.wind-watch.org/faq-output.php), every wind turbine
has a range of wind speeds, typically around 30–55 mph, in which it
produces maximum capacity. When wind speed is over 70 mph, it’s
important to start shutdown in order to protect the turbine from a high
wind storm. Customers often store high-velocity IoT data in DynamoDB and
use Amazon Kinesis streaming to extract data and store it in a
centralized data lake built on Amazon Simple Storage Service (Amazon
S3). To facilitate this ingestion pipeline, you can deploy AWS Lambda
functions or write custom code to [build a bridge between DynamoDB
Streams and Kinesis
streaming](https://aws.amazon.com/blogs/database/how-to-stream-data-from-amazon-dynamodb-to-amazon-aurora-using-aws-lambda-and-amazon-kinesis-firehose/).

Today, Amazon Kinesis Data Streams for DynamoDB enables you to publish
item-level changes in any DynamoDB table to a Kinesis data stream of
your choice. Additionally, you can leverage this feature for use cases
that require longer data retention on the stream and fan out to multiple
concurrent stream readers. You can also integrate with Amazon Kinesis
Data Analytics or Amazon Kinesis Data Firehose to publish data to
downstream destinations such as Amazon Elasticsearch Service (Amazon
ES), Amazon Redshift, or Amazon S3.

In this post, you use Kinesis Data Analytics Flink (KDA Flink) and
Amazon Simple Notification Service (Amazon SNS) to send a real-time
notification when wind speed is more than 60 mph, so that the operator
can take action to protect the turbine. You use the Kinesis Data Streams
for DynamoDB feature and take advantage of managed streaming delivery of
DynamoDB data to other AWS services without having to use Lambda or
write and maintain complex code. To process DynamoDB events from
Kinesis, you have multiple options: Amazon Kinesis Client Library (KCL)
applications, AWS Lambda, and KDA Flink. For this post, we showcase KDA
Flink, but this is just one of many available options.

Architecture
------------

The following architecture diagram illustrates the wind turbine
protection system.

<img src="media/image1.png" style="width:4.91875in;height:2.26458in" />

In the architecture, you have high-velocity wind speed data coming from
the wind turbine and stored in DynamoDB. To send an instant
notification, you need to query the data in real time and send a
notification when the wind speed is beyond the required limit. To
achieve this goal, you enable Kinesis Data Streams for DynamoDB, then
use KDA Flink to query real-time data in a 60-second tumbling window.
This aggregated data is stored in another data stream, which triggers an
email notification via Amazon SNS using Lambda when the wind speed more
than 60 mph. You can build this entire data pipeline in a serverless
manner.

Deploying the wind turbine data simulator 
-----------------------------------------

To replicate a real-life scenario, you need a wind turbine data
simulator. We use Amazon Amplify to deploy a user-friendly web
application that can generate the required data and store it in
DynamoDB. You need to have a H[Gitub account](https://github.com/) to
fork the Amplify app code and deploy it in your AWS account. Complete
the following steps to deploy the data simulator web app:

1.  Choose the following AWS Amplify link to launch the wind turbine
    data simulator web app: **To Do: move code to AWS samples repo**

<img src="media/image2.png" style="width:1.13819in;height:0.34028in" alt="Benefits of using AWS Amplify with Mobile Technology | by Tejeshwar Singh Gill | Medium" />

1.  Choose **Connect to** **GitHub** and provide credentials if needed.

<img src="media/image3.png" style="width:5.33333in;height:2.27014in" />

1.  In the **Deploy App** section, under **Select service role**, choose
    **Create new role.**

2.  Follow the instructions to create the role
    amplifyconsole-backend-role.

3.  When the role is created, choose it from the drop-down menu.

4.  Choose **Save and deploy**.

<img src="media/image4.png" style="width:3.26736in;height:2.08681in" />

On the next page, you see that the app dynamodb-streaming is ready to
deploy.

1.  

2.  Choose **Continue**.

3.  

4.  

<img src="media/image5.png" style="width:3.94861in;height:1.56458in" />

On the next page, you can see the app build and deploy progress, which
may take up to 10 minutes to complete.

1.  When the process is complete, choose the URL on the left to access
    the data generator UI.

2.  

3.  Make sure to save this URL to use in later steps.

<img src="media/image6.png" style="width:5.51458in;height:1.47778in" />

You also get an email during the build process related to your SSH key.
This email indicates that the build process created an SSH key on your
behalf to connect to the Amplify application with GitHub.

1.  

2.  On the login page, choose **Create account**.

<img src="media/image7.png" style="width:2.40417in;height:2.08333in" />

1.  Provide a user name, password, and valid email where the app can
    send you a one-time passcode to access the UI.

2.  After you log in, choose **Generate Data** to generate wind speed
    data.

3.  

4.  

5.  

6.  Choose the **Refresh** icon to show the data in the graph.

<img src="media/image8.png" style="width:6.02847in;height:2.05278in" />

You can generate a variety of data by changing the range of minimum and
maximum speeds and number of values.

To see the data in DynamoDB, choose the DynamoDB icon, note the table
name that starts with windspeed-, and navigate to that table on the
DynamoDB console.

<img src="media/image9.png" style="width:5.63403in;height:2.45972in" />

Now that the wind speed data simulator is ready, let’s deploy the rest
of the data pipeline.

Deploying the automated data pipeline using AWS CloudFormation
--------------------------------------------------------------

You use AWS CloudFormation
[templates](https://aws.amazon.com/cloudformation/aws-cloudformation-templates/)
to create all the necessary resources. This removes opportunities for
manual error, increases efficiency, and ensures consistent
configurations over time. You can view template in the GitHub
repository.

1.  Choose **Launch with CloudFormation Console**:

<img src="media/image10.png" style="width:2.32153in;height:0.43125in" />

template.yml to be hosted in blog bucket during final staging. Further,
hyperlink to be changed on the ‘Launch with CloudFormation Console’
(https://console.aws.amazon.com/cloudformation/home?region=us-west-2\#/stacks/create/template?stackName=kds-ddb-blog&templateURL=**https://s3-us-west-2.amazonaws.com/bucket.aws/ddbstreaming-blog/template.yaml)**

1.  Choose the US West (Oregon) Region (us-west-2).

2.  For **pEmail**, enter a valid email that the analytics pipeline can
    send notifications to.

3.  Choose **Next**.

<img src="media/image11.png" style="width:4.37778in;height:2.07778in" />

1.  Acknowledge that the template may create AWS Identity and Access
    Management (IAM) resources.

2.  

3.  Choose **Create stack**.

This CloudFormation template creates the following resources in your AWS
account:

-   An IAM role to provide a trust relationship between Kinesis and
    DynamoDB to replicate data from DynamoDB to the data stream

-   Two data streams:

    -   An input stream to replicate data from DynamoDB

    -   An output stream to store aggregated data from the KDA Flink app

-   

-   A Lambda function

-   An SNS topic to send an email notification of high wind speeds

1.  

2.  When the stack is ready, on the **Outputs** tab, note the values of
    both data streams.

<img src="media/image12.png" style="width:4.75347in;height:2.20278in" />

1.  Check your email and confirm your subscription to receive
    notifications.

Make sure check your junk folder if you don’t see the email in your
inbox.

<img src="media/image13.png" style="width:4.25139in;height:1.24583in" />

We can now use the Kinesis streaming for DynamoDB feature, which enables
you to have your data in both DynamoDB and Kinesis without having to use
Lambda or write custom code.

Enabling Kinesis streaming for DynamoDB 
---------------------------------------

AWS recently launched the Kinesis Data Streams for DynamoDB feature to
enable you to send data from DynamoDB to Kinesis Data Streams, in
addition to DynamoDB Streams. With this new functionality, you can have
your data in both DynamoDB and Kinesis without having to use Lambda or
write custom code. You can use the AWS Command Line Interface (AWS CLI)
or the AWS Management Console to enable this feature.

To enable from the console, complete the following steps:

1.  On the DynamoDB console, choose the table that you created earlier
    (it begins with the prefix windspeed-).

2.  

3.  On the **Overview** tab, choose **Manage streaming to Kinesis**.

<img src="media/image14.png" style="width:6.44792in;height:1.8728in" />

1.  Choose your input stream.

<img src="media/image15.tiff" style="width:4.91971in;height:2.11295in" />

1.  Choose **Enable**.

<img src="media/image16.tiff" style="width:4.91039in;height:3.33707in" />

1.  Choose **Close**.

<img src="media/image17.tiff" style="width:4.91944in;height:1.86897in" />

Make sure that **Stream enabled** is showing **Yes**.

<img src="media/image18.tiff" style="width:6.5in;height:1.49583in" />

Building the KDA Flink app for real-time data queries
-----------------------------------------------------

As part of the CloudFormation stack, the new KDA Flink application is
deployed in the configured Region. When the stack is up and running, you
should be able to see new KDA Flink application in the configured
Region. Choose **Run** to start the app.

<img src="media/image19.png" style="width:6.5in;height:2.75208in" />

When your app is running, you should see the following application
graph.

<img src="media/image20.png" style="width:6.44792in;height:2.64583in" />

Review the **Properties** section of the app, which shows you the input
and output streams that the app is using.

<img src="media/image21.png" style="width:6.44792in;height:2.375in" />

The following are a few code snippets of the JAVA Flink application,
which explain how the Flink application reads data from a data stream,
aggregates the data, and outputs it to another data stream.

In the following code, createSourceFromStaticConfig provides all the
wind turbine speed readings from the input stream in string format,
which we pass to the WindTurbineInputMap map function. This function
parses the string into the Tuple3 data type (exp
Tuple3&lt;&gt;(turbineID, speed, 1)). All Tuple3 messages are grouped by
turbineID to further apply a 1-minute tumbling window. The
AverageReducer reduce function provides two things: the sum of all the
speeds for the specific turbineId in the 1-minute window, and a count of
the messages for the specific turbineId in the 1-minute window. The
AverageMap map function takes the output of the AverageReducer reduce
function and transforms it into Tuple2 (exp Tuple2&lt;&gt;(turbineId,
averageSpeed)). Then we filter all turbineIds with an average speed
greater than 60 and map it to a JSON-formatted message, which we send to
the output stream using the createSinkFromStaticConfig sink function.

final StreamExecutionEnvironment env =  
StreamExecutionEnvironment.getExecutionEnvironment();  
  
DataStream&lt;String&gt; input = createSourceFromStaticConfig(env);  
  
input.map(new WindTurbineInputMap())  
.filter(v -&gt; v.f2 &gt; 0)  
.keyBy(0)  
.window(TumblingProcessingTimeWindows.of(Time.minutes(1)))  
.reduce(new AverageReducer())  
.map(new AverageMap())  
.filter(v -&gt; v.f1 &gt; 60)  
.map(v -&gt; "{ \\"turbineID\\": \\"" + v.f0 + "\\", \\"avgSpeed\\": "+
v.f1 +" }")  
.addSink(createSinkFromStaticConfig());  
  
env.execute("Wind Turbine Data Aggregator");

The following code demonstrates how the createSourceFromStaticConfig and
createSinkFromStaticConfig functions read the input and output steam
names from the properties of the KDA Flink application and establish the
source and sink of the streams:

private static DataStream&lt;String&gt; createSourceFromStaticConfig(  
StreamExecutionEnvironment env) throws IOException {  
Map&lt;String, Properties&gt; applicationProperties =
KinesisAnalyticsRuntime.getApplicationProperties();  
Properties inputProperties = new Properties();  
inputProperties.setProperty(ConsumerConfigConstants.AWS\_REGION,
(String)
applicationProperties.get("WindTurbineEnvironment").get("region"));  
inputProperties.setProperty(ConsumerConfigConstants.STREAM\_INITIAL\_POSITION,
"TRIM\_HORIZON");  
  
return env.addSource(new FlinkKinesisConsumer&lt;&gt;((String)
applicationProperties.get("WindTurbineEnvironment").get("inputStreamName"),  
new SimpleStringSchema(), inputProperties));  
}  
  
private static FlinkKinesisProducer&lt;String&gt;
createSinkFromStaticConfig() throws IOException {  
Map&lt;String, Properties&gt; applicationProperties =
KinesisAnalyticsRuntime.getApplicationProperties();  
Properties outputProperties = new Properties();  
outputProperties.setProperty(ConsumerConfigConstants.AWS\_REGION,
(String)
applicationProperties.get("WindTurbineEnvironment").get("region"));  
  
FlinkKinesisProducer&lt;String&gt; sink = new
FlinkKinesisProducer&lt;&gt;(new  
SimpleStringSchema(), outputProperties);  
sink.setDefaultStream((String)
applicationProperties.get("WindTurbineEnvironment").get("outputStreamName"));  
sink.setDefaultPartition("0");  
return sink;  
}

In the following code, the WindTurbineInputMap map function parses
Tuple3 out of the string message. Additionally, the AverageMap map and
AverageReducer reduce functions process messages to accumulate and
transform data.

public static class WindTurbineInputMap implements
MapFunction&lt;String, Tuple3&lt;String, Integer, Integer&gt;&gt; {  
@Override  
public Tuple3&lt;String, Integer, Integer&gt; map(String value) throws
Exception {  
String eventName = JsonPath.read(value, "$.eventName");  
if(eventName.equals("REMOVE")) {  
return new Tuple3&lt;&gt;("", 0, 0);  
}  
String turbineID = JsonPath.read(value,
"$.dynamodb.NewImage.deviceID.S");  
Integer speed = Integer.parseInt(JsonPath.read(value,
"$.dynamodb.NewImage.value.N"));  
return new Tuple3&lt;&gt;(turbineID, speed, 1);  
}  
}  
  
public static class AverageMap implements
MapFunction&lt;Tuple3&lt;String, Integer, Integer&gt;, Tuple2&lt;String,
Integer&gt;&gt; {  
@Override  
public Tuple2&lt;String, Integer&gt; map(Tuple3&lt;String, Integer,
Integer&gt; value) throws Exception {  
return new Tuple2&lt;&gt;(value.f0, (value.f1 / value.f2));  
}  
}  
  
public static class AverageReducer implements
ReduceFunction&lt;Tuple3&lt;String, Integer, Integer&gt;&gt; {  
@Override  
public Tuple3&lt;String, Integer, Integer&gt; reduce(Tuple3&lt;String,
Integer, Integer&gt; value1, Tuple3&lt;String, Integer, Integer&gt;
value2) {  
return new Tuple3&lt;&gt;(value1.f0, value1.f1 + value2.f1, value1.f2 +
1);  
}  
}

Receiving email notifications of high wind speed 
------------------------------------------------

The following screenshot shows an example of the notification email you
receive regarding high wind speeds.

<img src="media/image22.tiff" style="width:6.5in;height:2.6875in" />

To test the feature, in this section you generate high wind speed data
from the simulator, which is stored in DynamoDB, and get an email
notification when the average wind speed is more than 60 mph for a
1-minute period. You observe wind data flowing through the data stream
and KDA Flink.

1.  Generate wind speed data in the simulator and confirm that it’s
    stored in DynamoDB.

2.  On the Kinesis Data Streams console, choose your input data stream
    kds-ddb-blog-InputKinesisStream.

3.  On the monitoring tab of the stream, you can observe the **Get
    records - sum (Count)** metrics, which show multiple records
    captured by the data stream automatically.

4.  On the Kinesis Data Analytics console, choose on your KDA Flink
    application kds-ddb-blog-windTurbineAggregator.

5.  On the monitoring tab, you can observe the **Last Checkpint**
    metrics, which show multiple records captured by the KDA app
    automatically.

6.  On the Kinesis Data Streams console, choose the output stream
    kds-ddb-blog-OutputKinesisStream.

7.  On the monitoring tab, you can observe the **Get records - sum
    (Count)** metrics, which show multiple records output by the app.

8.  Finally, check your email if you got a notification.

If you don’t see a notification, change the data simulator value range
between a minimum of 50 and maximum of 90 and wait a few minutes.

Conclusion 
----------

As you have learned in this post, you can build an end-to-end serverless
analytics pipeline to get real-time insight from DynamoDB using Kinesis
without writing any complex code. This allows your team to focus on
solving business problems by getting useful insights immediately. There
are several use cases in IoT and application development to move data
quickly through an analytics pipeline where you can use this feature by
enabling Kinesis streaming for DynamoDB.

| <img src="media/image23.png" style="width:1.53125in;height:1.95833in" /> | **Saurabh Shrivastava** is a solutions architect leader and analytics/ML specialist working with global systems integrators. He works with AWS partners and customers to provide them with architectural guidance for building scalable architecture in hybrid and AWS environments. He enjoys spending time with his family outdoors and traveling to new destinations to discover new cultures. |
|--------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <img src="media/image24.png" style="width:1.5in;height:1.78125in" />     | **Sameer Goel** is a Solutions Architect in Seattle, who drives customers’ success by building prototypes on cutting-edge initiatives. Prior to joining AWS, Sameer graduated with a master’s degree from NEU Boston, a with Data Science concentration. He enjoys building and experimenting with creative projects and applications.                                                            |
| <img src="media/image25.jpeg" style="width:1.5in;height:1.53125in" />    | **Pratik Patel** is a Sr Technical Account Manager and streaming analytics specialist. He works with AWS customers and provides ongoing support and technical guidance to help plan and build solutions using best practices, and proactively helps keep customers’ AWS environments operationally healthy.                                                                                       |
