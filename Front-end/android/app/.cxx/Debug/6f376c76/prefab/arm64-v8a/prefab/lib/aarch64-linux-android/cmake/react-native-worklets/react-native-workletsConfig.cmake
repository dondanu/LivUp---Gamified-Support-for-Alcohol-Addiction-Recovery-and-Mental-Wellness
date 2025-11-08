if(NOT TARGET react-native-worklets::worklets)
add_library(react-native-worklets::worklets SHARED IMPORTED)
set_target_properties(react-native-worklets::worklets PROPERTIES
    IMPORTED_LOCATION "F:/My Projects~/LivUp---Gamified-Support-for-Alcohol-Addiction-Recovery-and-Mental-Wellness/Front-end/LivUpMobile/node_modules/react-native-worklets/android/build/intermediates/cxx/Debug/44w3l1z2/obj/arm64-v8a/libworklets.so"
    INTERFACE_INCLUDE_DIRECTORIES "F:/My Projects~/LivUp---Gamified-Support-for-Alcohol-Addiction-Recovery-and-Mental-Wellness/Front-end/LivUpMobile/node_modules/react-native-worklets/android/build/prefab-headers/worklets"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

