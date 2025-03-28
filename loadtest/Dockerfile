# Use the official Ubuntu base image
FROM ubuntu:latest

# Set the JMeter version you want
ENV JMETER_VERSION=5.6.3
ENV JMETER_HOME=/opt/jmeter
ENV JMETER_BIN=$JMETER_HOME/bin

# Install required packages
RUN apt-get update \
    && apt-get install -y \
       wget \
       unzip \
       openjdk-11-jre-headless \
    && rm -rf /var/lib/apt/lists/*

# Download and extract JMeter
RUN wget https://dlcdn.apache.org//jmeter/binaries/apache-jmeter-${JMETER_VERSION}.tgz \
    && mkdir -p $JMETER_HOME \
    && tar -xzf apache-jmeter-${JMETER_VERSION}.tgz -C $JMETER_HOME --strip-components=1 \
    && rm apache-jmeter-${JMETER_VERSION}.tgz

# Add JMeter to the PATH
ENV PATH $JMETER_BIN:$PATH

COPY ./ /app/

RUN rm -rf /app/result
RUN mkdir -p /app/result
RUN chmod a+w /app/result

# Show JMeter version by default
CMD ["jmeter", "--version"]
