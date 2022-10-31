import { withStore } from "./stores/default"
import { withNavigationStore } from "./stores/navigation";
import { Frame } from './components/frame';

export default withStore(withNavigationStore(Frame));
