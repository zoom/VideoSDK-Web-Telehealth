import * as React from "react";
import * as Slider from "@radix-ui/react-slider";
import audioSample1 from 'public/audio_samples';

const VolumeSlider = () => {
  
  const changeVolume = (e: any) => {
    audioSample1.play();
    audioSample1.volume = e[0] / 100;  
  }; 

  return (
	<form>
		<Slider.Root className="SliderRoot" defaultValue={[50]} max={100} step={1} onValueChange={changeVolume}>
			<Slider.Track className="SliderTrack">
				<Slider.Range className="SliderRange" />
			</Slider.Track>
			<Slider.Thumb className="SliderThumb" aria-label="Volume" />
		</Slider.Root>
	</form>
)};

export default VolumeSlider;