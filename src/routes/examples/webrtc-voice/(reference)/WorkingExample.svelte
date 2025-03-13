<script lang="ts">
  import { onMount } from "svelte";

  const peer1 = "peer1";
  const peer2 = "peer2";
  let myPeer = $state(peer1);

  let localAudio: HTMLAudioElement;
  let remoteAudio: HTMLAudioElement;

  let localStream: MediaStream;
  let remoteStream: MediaStream;

  let localPeerConnection: RTCPeerConnection;
  let remotePeerConnection: RTCPeerConnection;

  let localAudioContext: AudioContext;

  let animationFrameId1: number;
  let animationFrameId2: number;

  let localAudioIndicator = $state(0);
  let remoteAudioIndicator = $state(0);

  let remoteVolume = () => 0;

  const broadcastChannel = new BroadcastChannel("webrtc-voice");

  broadcastChannel.onmessage = (event) => {
    const { from, to, type } = event.data;

    if(to !== myPeer) {
      return;
    }

    if(type === "offer") {
      console.log("received offer", event.data.offer);
    }
  }

  function getVolume(stream: MediaStream) {
    let audioContext = new AudioContext();
    let analyser = audioContext.createAnalyser();
    let microphone = audioContext.createMediaStreamSource(stream);
    analyser.fftSize = 256;
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);

    microphone.connect(analyser);

    return function draw() {
      analyser.getByteFrequencyData(dataArray);
      let average = dataArray.reduce((a, b) => a + b) / bufferLength;
      return average;
    };
  }

  onMount(async () => {
    // const devices = await navigator.mediaDevices.enumerateDevices();
    // devices.forEach(device => console.log(device));
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStream = stream;
    localAudio.srcObject = stream;

    // DEBUG
    const localVolume = getVolume(stream);

    animationFrameId1 = requestAnimationFrame(function loop1() {
      localAudioIndicator = localVolume();
      animationFrameId1 = requestAnimationFrame(loop1);
    });

    animationFrameId2 = requestAnimationFrame(function loop2() {
      remoteAudioIndicator = remoteVolume();
      animationFrameId2 = requestAnimationFrame(loop2);
    });
  });

  async function call() {
    console.log("call");
    localPeerConnection = new RTCPeerConnection();
    remotePeerConnection = new RTCPeerConnection();

    localPeerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        console.log("onicecandidate-local");
        remotePeerConnection.addIceCandidate(event.candidate).catch(console.error);
      }
    });

    remotePeerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate) {
        console.log("onicecandidate-remote");
        localPeerConnection.addIceCandidate(event.candidate).catch(console.error);
      }
    });



    // <Debug>
    localPeerConnection.addEventListener('iceconnectionstatechange', () => {
      console.log("Local ICE connection state:", localPeerConnection.iceConnectionState);
    });

    remotePeerConnection.addEventListener('iceconnectionstatechange', () => {
      console.log("Remote ICE connection state:", remotePeerConnection.iceConnectionState);
    });
    // </Debug>


    remoteStream = new MediaStream();
    remotePeerConnection.addEventListener('track', (event) => {
      console.log("ontrack");
      remoteStream.addTrack(event.track);
      remoteAudio.srcObject = remoteStream;
      remoteVolume = getVolume(remoteStream);
    });


    localPeerConnection.addTrack(localStream.getAudioTracks()[0], localStream);


    const offer = await localPeerConnection.createOffer();
    await localPeerConnection.setLocalDescription(offer);
    console.log("offer", offer);

    // ...
    // signalling...
    // ...


    await remotePeerConnection.setRemoteDescription(offer);
    const answer = await remotePeerConnection.createAnswer();
    console.log("answer", answer);

    // ...
    // signalling...
    // ...

    await remotePeerConnection.setLocalDescription(answer);
    await localPeerConnection.setRemoteDescription(answer);
  }

  async function answer() {
  }

  function hangup() {
    // cancelAnimationFrame(animationFrameId1);
    // cancelAnimationFrame(animationFrameId2);
    // localStream.getTracks().forEach(track => track.stop());
    remoteStream.getTracks().forEach(track => track.stop());
  }
</script>

<h1>WebRTC voice call example</h1>

<input type="text" bind:value={myPeer} />
<audio bind:this={localAudio} autoplay muted></audio>
<progress class="pregress-red" max="100" value={localAudioIndicator}></progress>
<audio bind:this={remoteAudio} autoplay muted></audio>
<progress class="pregress-blue" max="100" value={remoteAudioIndicator}></progress>

<button onclick={call}>Call</button>
<button onclick={answer}>Answer</button>
<button onclick={hangup}>Hangup</button>

<style>
  progress {
    width: 200px;
    height: 10px;
    border: 1px solid black;
  }

  .pregress-red {
    &::-webkit-progress-value {
      background: red;
    }
  }

  .pregress-blue {
    &::-webkit-progress-value {
      background: blue;
    }
  }
</style>
