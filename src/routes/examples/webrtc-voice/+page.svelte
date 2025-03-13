<script lang="ts">
  import { onMount } from "svelte";

  let myPeerId = $state("peer1");
  let otherPeerId = $state("peer2");

  function switchPeer() {
    [myPeerId, otherPeerId] = [otherPeerId, myPeerId];
  }

  const broadcastChannel = new BroadcastChannel("webrtc-voice");

  let localAudio: HTMLAudioElement;
  let remoteAudio: HTMLAudioElement;

  let localStream: MediaStream;
  let remoteStream: MediaStream;

  let peerConnection: RTCPeerConnection;

  let animationFrameId1: number;
  let animationFrameId2: number;

  let localAudioIndicator = $state(0);
  let remoteAudioIndicator = $state(0);

  let remoteVolume = () => 0;

  broadcastChannel.onmessage = async (event) => {
    const { from, to, type } = event.data;

    if(to !== myPeerId) {
      return;
    }

    if(type === "offer") {
      console.log("received offer", event.data.offer);
      if(!peerConnection) {
        createPeerConnection();
      }
      await peerConnection.setRemoteDescription(event.data.offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      broadcastChannel.postMessage({ from: myPeerId, to: otherPeerId, type: "answer", answer });
    }

    if(type === "answer") {
      console.log("received answer", event.data.answer);
      await peerConnection.setRemoteDescription(event.data.answer);
    }

    if(type === "icecandidate") {
      console.log("received icecandidate", event.data.candidate);
      await peerConnection.addIceCandidate(event.data.candidate);
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

    // No need: already binded
    // remoteAudio = new Audio();
    // remoteAudio.autoplay = true;

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

  function createPeerConnection() {
    peerConnection = new RTCPeerConnection();

    localStream.getTracks().forEach((track) => {
      peerConnection!.addTrack(track, localStream);
    });

    peerConnection.addEventListener('icecandidate', (event) => {
      console.log("onicecandidate");
      if(event.candidate) {
        const candidate = JSON.parse(JSON.stringify(event.candidate));
        broadcastChannel.postMessage({ from: myPeerId, to: otherPeerId, type: "icecandidate", candidate });
      }
    });

    peerConnection.addEventListener('track', (event) => {
      console.log("ontrack");
      if(event.streams && event.streams[0]) {
        remoteStream = event.streams[0];
        remoteAudio.srcObject = remoteStream;
        remoteVolume = getVolume(remoteStream);
      }
    });
  }

  async function call() {
    console.log("call");
    if(!peerConnection) {
      createPeerConnection();
    }

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    broadcastChannel.postMessage({ from: myPeerId, to: otherPeerId, type: "offer", offer });
  }

  function hangup() {
    // cancelAnimationFrame(animationFrameId1);
    // cancelAnimationFrame(animationFrameId2);
    // localStream.getTracks().forEach(track => track.stop());
    remoteStream.getTracks().forEach(track => track.stop());
    if(peerConnection) {
      peerConnection.close();
      peerConnection = null;
      broadcastChannel.postMessage({ from: myPeerId, to: otherPeerId, type: "hangup" });
    }
  }
</script>

<h1>WebRTC voice call example</h1>

Me: <input type="text" bind:value={myPeerId} /><br/>
Other: <input type="text" bind:value={otherPeerId} /><br/>
<button onclick={switchPeer}>Switch</button><br/>

<audio bind:this={localAudio} autoplay muted></audio>
<progress class="pregress-red" max="100" value={localAudioIndicator}></progress>
<audio bind:this={remoteAudio} autoplay muted></audio>
<progress class="pregress-blue" max="100" value={remoteAudioIndicator}></progress>

<button onclick={call}>Call</button>
<button onclick={hangup}>Hangup</button>

<hr/>

<h4>How to use it</h4>
<p>Open two windows with same URL</p>
<p>Click "Switch" button on one window to set caller/callee</p>
<p>Click "Call" on the first window</p>

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
