
# syntax=docker/dockerfile:1
##############################################################################
# Jenkins build-agent image for React Native (Android) CI
#
# Includes: JDK 21, Node 22, Android SDK cmdline-tools + build-tools/platform/NDK,
# git, and the Firebase CLI (for `firebase appdistribution:distribute`).
#
# Use this as a Jenkins *agent* image (static Docker Cloud agent, or via
# `agent { docker { image '<tag>' } }` in a Jenkinsfile) rather than baking
# these tools onto a bare host.
##############################################################################

FROM ubuntu:24.04

ARG NODE_MAJOR=22
# Newer cmdline-tools build, needed so sdkmanager understands android-36 repo metadata.
# Verify against https://developer.android.com/studio#command-line-tools-only before building.
ARG ANDROID_CMDLINE_TOOLS_VERSION=13114758
ARG ANDROID_PLATFORM=android-36
ARG ANDROID_BUILD_TOOLS=36.0.0
ARG ANDROID_NDK_VERSION=27.1.12297006
ARG JENKINS_AGENT_HOME=/home/jenkins
ARG JENKINS_UID=1001
ARG JENKINS_GID=1001

ENV DEBIAN_FRONTEND=noninteractive \
    LANG=C.UTF-8 \
    ANDROID_HOME=/opt/android-sdk \
    ANDROID_SDK_ROOT=/opt/android-sdk \
    GRADLE_USER_HOME=${JENKINS_AGENT_HOME}/.gradle

# --- Base OS packages -------------------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        wget \
        unzip \
        git \
        ca-certificates \
        gnupg \
        openjdk-21-jdk-headless \
        python3 \
        build-essential \
        openssh-client \
    && rm -rf /var/lib/apt/lists/*

# Resolve JAVA_HOME dynamically — works on both amd64 and arm64 images
RUN real_java_home=$(readlink -f /usr/bin/javac | sed "s:/bin/javac::") \
    && ln -sfn "$real_java_home" /usr/lib/jvm/default-java
ENV JAVA_HOME=/usr/lib/jvm/default-java

# --- Node.js -----------------------------------------------------------------
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/* \
    && node -v && npm -v

# --- Firebase CLI (for appdistribution:distribute) ---------------------------
RUN npm install -g firebase-tools

# --- Android SDK cmdline-tools -------------------------------------------------
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools \
    && cd ${ANDROID_HOME}/cmdline-tools \
    && curl -fsSL -o cmdline-tools.zip \
        "https://dl.google.com/android/repository/commandlinetools-linux-${ANDROID_CMDLINE_TOOLS_VERSION}_latest.zip" \
    && unzip -q cmdline-tools.zip \
    && rm cmdline-tools.zip \
    && mv cmdline-tools latest

ENV PATH=${JAVA_HOME}/bin:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${PATH}

# Accept licenses non-interactively, then install the pieces gradlew needs
# RUN yes | sdkmanager --licenses > /dev/null \
#     && sdkmanager \
#         "platform-tools" \
#         "platforms;${ANDROID_PLATFORM}" \
#         "build-tools;${ANDROID_BUILD_TOOLS}" \
#         "ndk;${ANDROID_NDK_VERSION}"
RUN yes | sdkmanager --licenses || true
RUN sdkmanager --verbose \
        "platform-tools" \
        "platforms;${ANDROID_PLATFORM}" \
        "build-tools;${ANDROID_BUILD_TOOLS}" \
        "ndk;${ANDROID_NDK_VERSION}"
ENV ANDROID_NDK_HOME=${ANDROID_HOME}/ndk/${ANDROID_NDK_VERSION}

# # --- Non-root jenkins user (agents shouldn't run as root) --------------------
# RUN groupadd -g ${JENKINS_GID} jenkins \
#     && useradd -m -u ${JENKINS_UID} -g ${JENKINS_GID} -d ${JENKINS_AGENT_HOME} -s /bin/bash jenkins \
#     && mkdir -p ${GRADLE_USER_HOME} \
#     && chown -R jenkins:jenkins ${JENKINS_AGENT_HOME} ${ANDROID_HOME}

# --- Non-root jenkins user (agents shouldn't run as root) --------------------
    RUN if getent passwd ubuntu > /dev/null; then userdel -r ubuntu; fi \
    && if getent group ubuntu > /dev/null; then groupdel ubuntu; fi \
    && groupadd -g ${JENKINS_GID} jenkins \
    && useradd -m -u ${JENKINS_UID} -g ${JENKINS_GID} -d ${JENKINS_AGENT_HOME} -s /bin/bash jenkins \
    && mkdir -p ${GRADLE_USER_HOME} \
    && chown -R jenkins:jenkins ${JENKINS_AGENT_HOME} ${ANDROID_HOME}

USER jenkins
WORKDIR ${JENKINS_AGENT_HOME}

# Sanity checks at build time
RUN java -version && node -v && npm -v && sdkmanager --version

CMD ["/bin/bash"]