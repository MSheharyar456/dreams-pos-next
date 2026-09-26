"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const router = useRouter();

  
  const [projectName, setProjectName] = useState<string>("Dreams POS");

  useEffect(() => {
    async function loadSettings() {
      try {
        const { getSettings } = await import('@/app/actions/settings');
        const settings = await getSettings();
        if (settings && settings.project_name) {
          setProjectName(settings.project_name);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadSettings();
  }, []);

const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="header">
      <div className="header-left active">
        <Link href="/dashboard" className="logo">
          <img src="/assets/img/logo.png" alt="" />
        </Link>
        <Link href="/dashboard" className="logo-small">
          <img src="/assets/img/logo-small.png" alt="" />
        </Link>
        <a id="toggle_btn" href="#"></a>
      </div>
      <a id="mobile_btn" className="mobile_btn" href="#sidebar">
        <span className="bar-icon">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </a>
      
      <div className="d-none d-md-flex position-absolute translate-middle-x align-items-center" style={{ height: '60px', left: '35%' }}>
        <h4 className="m-0" style={{ fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
        <span style={{ color: '#0B3B60' }}>JAVEED ALNOOR</span>{' '}
        <span style={{ color: '#F69220' }}>BUILDING</span>
      </h4>
      </div>
<ul className="nav user-menu">
        <li className="nav-item">
          <div className="top-nav-search">
            <a href="#" className="responsive-search">
              <i className="fa fa-search"></i>
            </a>
            <form action="#">
              <div className="searchinputs">
                <input type="text" placeholder="Search Here ..." />
                <div className="search-addon">
                  <span>
                    <img src="/assets/img/icons/closes.svg" alt="img" />
                  </span>
                </div>
              </div>
              <a className="btn" id="searchdiv">
                <img src="/assets/img/icons/search.svg" alt="img" />
              </a>
            </form>
          </div>
        </li>
        <li className="nav-item dropdown has-arrow flag-nav">
          <a
            className="nav-link dropdown-toggle"
            data-bs-toggle="dropdown"
            href="#"
            role="button"
          >
            <img src="/assets/img/flags/us1.png" alt="" height="20" />
          </a>
          <div className="dropdown-menu dropdown-menu-right">
            <a href="#" className="dropdown-item">
              <img src="/assets/img/flags/us.png" alt="" height="16" /> English
            </a>
            <a href="#" className="dropdown-item">
              <img src="/assets/img/flags/fr.png" alt="" height="16" /> French
            </a>
            <a href="#" className="dropdown-item">
              <img src="/assets/img/flags/es.png" alt="" height="16" /> Spanish
            </a>
            <a href="#" className="dropdown-item">
              <img src="/assets/img/flags/de.png" alt="" height="16" /> German
            </a>
          </div>
        </li>
        <li className="nav-item dropdown">
          <a
            href="#"
            className="dropdown-toggle nav-link"
            data-bs-toggle="dropdown"
          >
            <img src="/assets/img/icons/notification-bing.svg" alt="img" />{" "}
            <span className="badge rounded-pill">4</span>
          </a>
          <div className="dropdown-menu notifications">
            <div className="topnav-dropdown-header">
              <span className="notification-title">Notifications</span>
              <a href="#" className="clear-noti">
                {" "}
                Clear All{" "}
              </a>
            </div>
            <div className="noti-content">
              <ul className="notification-list">
                <li className="notification-message">
                  <a href="#">
                    <div className="media d-flex">
                      <span className="avatar flex-shrink-0">
                        <img alt="" src="/assets/img/profiles/avatar-02.jpg" />
                      </span>
                      <div className="media-body flex-grow-1">
                        <p className="noti-details">
                          <span className="noti-title">John Doe</span> added new
                          task{" "}
                          <span className="noti-title">
                            Patient appointment booking
                          </span>
                        </p>
                        <p className="noti-time">
                          <span className="notification-time">4 mins ago</span>
                        </p>
                      </div>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
            <div className="topnav-dropdown-footer">
              <a href="#">View all Notifications</a>
            </div>
          </div>
        </li>
        <li className="nav-item dropdown has-arrow main-drop">
          <a
            href="#"
            className="dropdown-toggle nav-link userset"
            data-bs-toggle="dropdown"
          >
            <span className="user-img">
              <img src="/assets/img/profiles/avator1.jpg" alt="" />
              <span className="status online"></span>
            </span>
          </a>
          <div className="dropdown-menu menu-drop-user">
            <div className="profilename">
              <div className="profileset">
                <span className="user-img">
                  <img src="/assets/img/profiles/avator1.jpg" alt="" />
                  <span className="status online"></span>
                </span>
                <div className="profilesets">
                  <h6>John Doe</h6>
                  <h5>Admin</h5>
                </div>
              </div>
              <hr className="m-0" />
              <Link className="dropdown-item" href="#">
                {" "}
                <img src="/assets/img/icons/users1.svg" className="me-2" alt="img" style={{ width: '16px' }} /> My Profile
              </Link>
              <Link className="dropdown-item" href="#">
                <img src="/assets/img/icons/settings.svg" className="me-2" alt="img" style={{ width: '16px' }} />Settings
              </Link>
              <hr className="m-0" />
              <a
                href="#"
                className="dropdown-item logout pb-0"
                onClick={handleLogout}
              >
                <img
                  src="/assets/img/icons/log-out.svg"
                  className="me-2"
                  alt="img"
                />
                Logout
              </a>
            </div>
          </div>
        </li>
      </ul>
      <div className="dropdown mobile-user-menu">
        <a
          href="#"
          className="nav-link dropdown-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="fa fa-ellipsis-v"></i>
        </a>
        <div className="dropdown-menu dropdown-menu-right">
          <Link className="dropdown-item" href="#">
            My Profile
          </Link>
          <Link className="dropdown-item" href="#">
            Settings
          </Link>
          <a className="dropdown-item" href="#" onClick={handleLogout}>
            Logout
          </a>
        </div>
      </div>
    </div>
  );
}
