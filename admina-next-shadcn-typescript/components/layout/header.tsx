import MessageDropdown from '../shared/message-dropdown';
import { ModeToggle } from '../shared/mode-toggle';
import ProfileDropdown from '../shared/profile-dropdown';
import SearchBox from '../shared/search-box';
import SettingsTrigger from '../shared/settings-trigger';
import { SidebarCollapseTrigger } from '../sidebar';
import NotificationDropdown from './../shared/notification-dropdown';

const Header = () => {
    return (
        <header className="dashboard-header sticky top-0 z-30 flex items-center justify-between sm:h-[72px] h-16 shrink-0 gap-2 md:px-6 px-4 py-3 bg-white dark:bg-[#273142] border-b border-gray-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
                <SidebarCollapseTrigger className="-ms-1" />
                <SearchBox />
            </div>
            <div className="flex items-center sm:gap-3 gap-2">
                <MessageDropdown />
                <ModeToggle />
                <NotificationDropdown />
                <SettingsTrigger />
                <ProfileDropdown />
            </div>
        </header>
    );
};

export default Header;
