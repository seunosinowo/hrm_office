import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// icon library
import {
  BoxCubeIcon,
  ChevronDownIcon,
  HorizontaLDots,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean; subItems?: { name: string; path: string }[] }[];
};

const getRolePrefix = (role: string) => {
  switch (role) {
    case 'hr':
      return '/hr';
    case 'assessor':
      return '/assessor';
    default:
      return '';
  }
};

// EmployeeNavItems
const employeeNavItems: NavItem[] = [
  {
    icon: <PageIcon />,
    name: "Page Description",
    path: "/page-description",
  },
  {
    icon: <UserCircleIcon />,
    name: "User & Role Management",
    subItems: [
      // { name: "User", path: "/user" },
      { name: "Employee Details", path: "/employee-details" },
      { name: "Employee Job Assignment", path: "/employee-job-assignment" },
      { name: "Employee Assessor Assign", path: "/employee-assessor-assign" },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Competency Framework",
    subItems: [
      { name: "Competency Description", path: "/competency-description" },
      { name: "Competency Category", path: "/competency-category" },
      { name: "Competency", path: "/competency" },
      { name: "Competency Domain", path: "/competency-domain" },
      { name: "Competency Proficiency", path: "/proficiency-description" },
    ],
  },
  {
    icon: <TableIcon />,
    name: "Job Profiling",
    subItems: [
      { name: "Job", path: "/job" },
      { name: "Job Competency Profile", path: "/job-competency-profile" },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Assessment Mgt",
    subItems: [
      { name: "Employee Assessment", path: "/employee-assessment" },
      // employee routes are namespaced under /employee in App.tsx
      { name: "Performance Appraisal", path: "/employee/performance-appraisal" },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Analytics",
    subItems: [
      { name: "Individual Gap", path: "/individual-gap" },
      // { name: "Organization Gap", path: "/organization-gap" }, // Removed as employees don't need organization gap analysis
    ],
  },
];

// assessorNavItems
const assessorNavItems: NavItem[] = [
  {
    icon: <PageIcon />,
    name: "Page Description",
    path: "/assessor/page-description",
  },
  {
    icon: <UserCircleIcon />,
    name: "User & Role Management",
    subItems: [
      // { name: "User", path: "/assessor/user" },
      { name: "Employee Details", path: "/assessor/employee-details" },
      { name: "Employee Job Assignment", path: "/assessor/employee-job-assignment" },
      { name: "Employee Assessor Assign", path: "/assessor/employee-assessor-assign" },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Competency Framework",
    subItems: [
      { name: "Competency Description", path: "/assessor/competency-description" },
      { name: "Competency Category", path: "/assessor/competency-category" },
      { name: "Competency", path: "/assessor/competency" },
      { name: "Competency Domain", path: "/assessor/competency-domain" },
      { name: "Competency Proficiency", path: "/assessor/proficiency-description" },
    ],
  },
  {
    icon: <TableIcon />,
    name: "Job Profiling",
    subItems: [
      { name: "Job", path: "/assessor/job" },
      { name: "Job Competency Profile", path: "/assessor/job-competency-profile" },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Assessment Mgt",
    subItems: [
      { name: "Assessor Assessment", path: "/assessor/assessment" },
      { name: "Performance Appraisal", path: "/assessor/performance-appraisal" },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Analytics",
    subItems: [
      { name: "Individual Gap", path: "/assessor/individual-gap" },
      // { name: "Organization Gap", path: "/assessor/organization-gap" }, // Commented out as requested
    ],
  },
];

// hrNavItems
const hrNavItems: NavItem[] = [
  {
    icon: <PageIcon />,
    name: "Page Description",
    path: "/hr/page-description",
  },
  {
    icon: <UserCircleIcon />,
    name: "User & Role Management",
    subItems: [
      // { name: "User", path: "/hr/user" },
      { name: "Employee Details", path: "/hr/employee-details" },
      { name: "Assign Job Roles", path: "/hr/employee-job-assignment" },
      { name: "Assign an Assessor", path: "/hr/employee-assessor-assign" },
      { name: "Role Management", path: "/hr/role-management" },
    ],
  },
  {
    icon: <PieChartIcon />,
    name: "Competency Framework",
    subItems: [
      { name: "Competency Description", path: "/hr/competency-description" },
      { name: "Competency Category", path: "/hr/competency-category" },
      { name: "Competency", path: "/hr/competency" },
      { name: "Competency Domain", path: "/hr/competency-domain" },
      { name: "Competency Proficiency", path: "/hr/competency-proficiency" },
    ],
  },
  {
    icon: <TableIcon />,
    name: "Job Profiling",
    subItems: [
      { name: "Job", path: "/hr/job" },
      { name: "Job Competency Profile", path: "/hr/job-competency-profile" },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Assessment Mgt",
    subItems: [
      { name: "Assessor Assessment", path: "/hr/assessor-assessment" },
      { name: "Consensus Assessment", path: "/hr/consensus-assessment" },
      { name: "Performance Appraisal", path: "/hr/performance-appraisal" },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Analytics",
    subItems: [
      // { name: "Individual Gap", path: "/hr/individual-gap" }, // Removed as HR doesn't need individual gap analysis
      { name: "Organization Gap", path: "/hr/organization-gap" },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = (path: string) => {
    if (!user) return false;

    // Define role hierarchy for path matching
    const roleHierarchy: { [key: string]: string[] } = {
      'hr': ['hr', 'assessor', 'employee'],
      'assessor': ['assessor', 'employee'],
      'employee': ['employee']
    };

    // Get the user's highest role
    let highestRole = 'employee';
    if (user.roles.includes('hr')) {
      highestRole = 'hr';
    } else if (user.roles.includes('assessor')) {
      highestRole = 'assessor';
    }

    // Get all prefixes this user can access
    const accessiblePrefixes = roleHierarchy[highestRole].map(role => getRolePrefix(role));

    // Check if the current path exactly matches the given path
    for (const prefix of accessiblePrefixes) {
      const fullPath = path.startsWith(prefix) ? path : `${prefix}${path}`;

      // Use exact path matching instead of startsWith
      // This ensures only the exact path is considered active
      if (location.pathname === fullPath) {
        return true;
      }
    }

    return false;
  };

  const getNavItems = () => {
    if (!user) return [];

    // Return the nav items based on the user's highest role
    if (user.roles.includes('hr')) {
      return hrNavItems;
    } else if (user.roles.includes('assessor')) {
      return assessorNavItems;
    } else {
      return employeeNavItems;
    }
  };

  const navItems = getNavItems();

  useEffect(() => {
    let submenuMatched = false;
    ["main"].forEach((menuType) => {
      const items = navItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          // Check if any subItem is active
          const hasActiveSubItem = nav.subItems.some(subItem => isActive(subItem.path));

          if (hasActiveSubItem) {
            setOpenSubmenu({
              type: menuType as "main",
              index,
            });
            submenuMatched = true;
          }
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, navItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-expanded"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-expanded"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text whitespace-nowrap overflow-hidden text-ellipsis">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-gray-700 dark:text-gray-300"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text whitespace-nowrap overflow-hidden text-ellipsis">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        {/* Use a div instead of a Link when user is authenticated */}
        {user ? (
          <div className="cursor-default">
            {isExpanded || isHovered || isMobileOpen ? (
              <>
                <img
                  className="dark:hidden"
                  src="/images/logo/logo.svg"
                  alt="Logo"
                  width={150}
                  height={40}
                />
                <img
                  className="hidden dark:block"
                  src="/images/hrmdark.png"
                  alt="Logo"
                  width={150}
                  height={40}
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-left">Employee Competency Assessments System</p>
              </>
            ) : (
              <img
                src="/images/logo/logo-icon.svg"
                alt="Logo"
                width={32}
                height={32}
              />
            )}
          </div>
        ) : (
          <Link to="/">
            {isExpanded || isHovered || isMobileOpen ? (
              <>
                <img
                  className="dark:hidden"
                  src="/images/logo/logo.svg"
                  alt="Logo"
                  width={150}
                  height={40}
                />
                <img
                  className="hidden dark:block"
                  src="/images/hrmdark.png"
                  alt="Logo"
                  width={150}
                  height={40}
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-left">Employee Competency Assessments System</p>
              </>
            ) : (
              <img
                src="/images/logo/logo-icon.svg"
                alt="Logo"
                width={32}
                height={32}
              />
            )}
          </Link>
        )}
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;