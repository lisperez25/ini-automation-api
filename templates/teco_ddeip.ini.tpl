
; ======================================================
; TEMPLATE PARAMETRIZADO - Generado desde Google Sheets / Omuni
; Cliente: {{razon_social}}
; Nombre archivo: {{nombre_archivo}}
; Tipo: {{tipo}}
; ======================================================
; IMPORTANTE:
; Insertar arriba de este bloque el encabezado y el bloque [System]
; descargado del equipo base, si aplica para el modelo/firmware.
; ======================================================

[BSP Params]

PCMLawSelect = 1
UdpPortSpacing = 10
EnterCpuOverloadPercent = 99
ExitCpuOverloadPercent = 95

[Analog Params]

PolarityReversalType = 1
MinFlashHookTime = 100

[ControlProtocols Params]

AdminStateLockControl = 0

[PSTN Params]

ProtocolType = 7
ClockMaster = 1
FramingMethod = c
LineCode = 2
CASTablesNum = 1
CASFileName_0 = 
CASFileName_1 = 
CASFileName_2 = 
CASFileName_3 = 
CASFileName_4 = 
CASFileName_5 = 
CASFileName_6 = 
CASFileName_7 = 
CasTrunkDialPlanName_0 = 
CasTrunkDialPlanName_1 = 
CasTrunkDialPlanName_2 = 
CasTrunkDialPlanName_3 = 
CasTrunkDialPlanName_4 = 
CasTrunkDialPlanName_5 = 
CasTrunkDialPlanName_6 = 
CasTrunkDialPlanName_7 = 

[Voice Engine Params]

IdlePCMPattern = 213
IdleABCDPattern = 9
BrokenConnectionEventTimeout = 30
CASTransportType = 1
FaxTransportMode = 0
V22ModemTransportType = 0
V23ModemTransportType = 0
V32ModemTransportType = 0
V34ModemTransportType = 0
RFC2833TxPayloadType = 97
V34FAXTRANSPORTTYPE = 0
PLThresholdLevelsPerMille_0 = 5
PLThresholdLevelsPerMille_1 = 10
PLThresholdLevelsPerMille_2 = 20
PLThresholdLevelsPerMille_3 = 50

[SIP Params]

ISPROXYUSED = 1
GWDEBUGLEVEL = 5
HOOKFLASHOPTION = 4
ISFAXUSED = 2
MSLDAPPRIMARYKEY = telephoneNumber
SYSLOGOPTIMIZATION = 1
FIRSTTXDTMFOPTION = 4
SECONDTXDTMFOPTION = 4
ALLOCATIONWEBRTCSESSIONS = 100

[IPsec Params]

[SNMP Params]

DisableSNMP = 0

[ PhysicalPortsTable ]

FORMAT Index = Port, Mode, SpeedDuplex, PortDescription, GroupMember;
PhysicalPortsTable 0 = "GE_4_1", 1, 4, "User Port #0", "GROUP_1";
PhysicalPortsTable 1 = "GE_4_2", 1, 4, "User Port #1", "GROUP_1";
PhysicalPortsTable 2 = "GE_4_3", 1, 4, "User Port #2", "GROUP_2";
PhysicalPortsTable 3 = "GE_4_4", 1, 4, "User Port #3", "GROUP_2";

[ \PhysicalPortsTable ]

[ EtherGroupTable ]

FORMAT Index = Group, Mode, Member1, Member2;
EtherGroupTable 0 = "GROUP_1", 2, "GE_4_1", "GE_4_2";
EtherGroupTable 1 = "GROUP_2", 2, "GE_4_3", "GE_4_4";
EtherGroupTable 2 = "GROUP_3", 0, "", "";
EtherGroupTable 3 = "GROUP_4", 0, "", "";

[ \EtherGroupTable ]

[ DeviceTable ]

FORMAT Index = VlanID, UnderlyingInterface, DeviceName, Tagging, MTU;
DeviceTable 0 = 1, "GROUP_1", "vlan 1", 0, 1500;
DeviceTable 1 = {{vlan_dde}}, "GROUP_2", "VLAN {{vlan_dde}}", 1, 1500;
DeviceTable 2 = {{vlan_gestion}}, "GROUP_2", "VLAN {{vlan_gestion}}", 1, 1500;

[ \DeviceTable ]

[ InterfaceTable ]

FORMAT Index = ApplicationTypes, InterfaceMode, IPAddress, PrefixLength, Gateway, InterfaceName, PrimaryDNSServerIPAddress, SecondaryDNSServerIPAddress, UnderlyingDevice;
InterfaceTable 0 = 0, 10, {{ip_gestion}}, {{cidr_gestion}}, {{gateway_gestion}}, "LAN DENOC", {{dns_teco}}, 0.0.0.0, "VLAN {{vlan_gestion}}";
InterfaceTable 1 = 5, 10, {{ip_dde}}, {{cidr_dde}}, {{gateway_dde}}, "DDEIP", 0.0.0.0, 0.0.0.0, "VLAN {{vlan_dde}}";

[ \InterfaceTable ]

[ WebUsers ]

FORMAT Index = Username, Password, Status, PwAgeInterval, SessionLimit, CliSessionLimit, SessionTimeout, BlockTime, UserLevel, PwNonce, SSHPublicKey, PrevPassw1, PrevPassw2, PrevPassw3, PrevPassw4;
WebUsers 0 = "Admin", "$1$e0lKSUZM5rG0sOGytrDsub+/6LS7uaL396Wg9KWhq6v5+vitq/6TmJfHk52Sw8rLzMrPyZuWhoiDioWBhoHa34o=", 1, 0, 3, -1, 15, 60, 200, "719217c162bfc747188bd7b63c701ef6", "", "", "", "", "";
WebUsers 1 = "User", "$1$E3dyJSYvLS4seiUkKipGGUBCQRdDERFITxwcHR4dBQhXAQdQDgQKAQwICgkMCXhxJCAidSR/KyorKH97KixoMzc=", 1, 0, 2, -1, 15, 60, 50, "9feabf6908645c90e7b762857ce771f9", "", "", "", "", "";

[ \WebUsers ]

[ TLSContexts ]

FORMAT Index = Name, TLSVersion, DTLSVersion, ServerCipherString, ClientCipherString, ServerCipherTLS13String, ClientCipherTLS13String, KeyExchangeGroups, RequireStrictCert, TlsRenegotiation, MiddleboxCompatMode, OcspEnable, OcspServerPrimary, OcspServerSecondary, OcspServerPort, OcspDefaultResponse, DHKeySize;
TLSContexts 0 = "default", 0, 0, "DEFAULT", "DEFAULT", "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256", "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256", "X25519:P-256:P-384:X448", 0, 1, 0, 0, , , 2560, 0, 2048;

[ \TLSContexts ]

[ DebugRecordingIpTraceVlanId ]

FORMAT Index = IpTraceVlanId;
DebugRecordingIpTraceVlanId 0 = "";

[ \DebugRecordingIpTraceVlanId ]

[ AudioCodersGroups ]

FORMAT Index = Name;
AudioCodersGroups 0 = "AudioCodersGroups_0";

[ \AudioCodersGroups ]

[ IpProfile ]

FORMAT Index = ProfileName, IpPreference, CodersGroupName, IsFaxUsed, JitterBufMinDelay, JitterBufOptFactor, IPDiffServ, SigIPDiffServ, RTPRedundancyDepth, CNGmode, VxxTransportType, NSEMode, IsDTMFUsed, PlayRBTone2IP, EnableEarlyMedia, ProgressIndicator2IP, EnableEchoCanceller, CopyDest2RedirectNumber, MediaSecurityBehaviour, CallLimit, DisconnectOnBrokenConnection, FirstTxDtmfOption, SecondTxDtmfOption, RxDTMFOption, EnableHold, InputGain, VoiceVolume, AddIEInSetup, SBCExtensionCodersGroupName, MediaIPVersionPreference, TranscodingMode, SBCAllowedMediaTypes, SBCAllowedAudioCodersGroupName, SBCAllowedVideoCodersGroupName, SBCAllowedCodersMode, SBCMediaSecurityBehaviour, SBCCryptoGroupName, SBCRFC2833Behavior, SBCAlternativeDTMFMethod, SBCSendMultipleDTMFMethods, SBCReceiveMultipleDTMFMethods, SBCAssertIdentity, AMDSensitivityParameterSuit, AMDSensitivityLevel, AMDMaxGreetingTime, AMDMaxPostSilenceGreetingTime, SBCDiversionMode, SBCHistoryInfoMode, EnableQSIGTunneling, SBCFaxCodersGroupName, SBCFaxBehavior, SBCFaxOfferMode, SBCFaxAnswerMode, SbcPrackMode, SBCSessionExpiresMode, SBCRemoteUpdateSupport, SBCRemoteReinviteSupport, SBCRemoteDelayedOfferSupport, SBCRemoteReferBehavior, SBCRemote3xxBehavior, SBCRemoteMultiple18xSupport, SBCRemoteEarlyMediaResponseType, SBCRemoteEarlyMediaSupport, EnableSymmetricMKI, MKISize, SBCEnforceMKISize, SBCRemoteEarlyMediaRTP, SBCRemoteSupportsRFC3960, SBCRemoteCanPlayRingback, EnableEarly183, EarlyAnswerTimeout, SBC2833DTMFPayloadType, SBCUserRegistrationTime, ResetSRTPStateUponRekey, AmdMode, SBCReliableHeldToneSource, GenerateSRTPKeys, SBCPlayHeldTone, SBCRemoteHoldFormat, SBCRemoteReplacesBehavior, SBCSDPPtimeAnswer, SBCPreferredPTime, SBCUseSilenceSupp, SBCRTPRedundancyBehavior, SBCPlayRBTToTransferee, SBCRTCPMode, SBCJitterCompensation, SBCRemoteRenegotiateOnFaxDetection, JitterBufMaxDelay, SBCUserBehindUdpNATRegistrationTime, SBCUserBehindTcpNATRegistrationTime, SBCSDPHandleRTCPAttribute, SBCRemoveCryptoLifetimeInSDP, SBCIceMode, SBCRTCPMux, SBCMediaSecurityMethod, SBCHandleXDetect, SBCRTCPFeedback, SBCRemoteRepresentationMode, SBCKeepVIAHeaders, SBCKeepRoutingHeaders, SBCKeepUserAgentHeader, SBCRemoteMultipleEarlyDialogs, SBCRemoteMultipleAnswersMode, SBCDirectMediaTag, SBCAdaptRFC2833BWToVoiceCoderBW, CreatedByRoutingServer, UsedByRoutingServer, SBCFaxReroutingMode, SBCMaxCallDuration, SBCGenerateRTP, SBCISUPBodyHandling, SBCISUPVariant, SBCVoiceQualityEnhancement, SBCMaxOpusBW, SBCEnhancedPlc, LocalRingbackTone, LocalHeldTone, SBCGenerateNoOp, SBCRemoveUnKnownCrypto, SBCMultipleCoders, DataDiffServ, SBCMSRPReinviteUpdateSupport, SBCMSRPOfferSetupRole, SBCMSRPEmpMsg, SBCRenumberMID, SBCAllowOnlyNegotiatedPT, RTCPEncryption;
IpProfile 0 = "IP_Profile_1", 1, "AudioCodersGroups_0", 2, 10, 10, 46, 24, 0, 0, 2, 0, 0, 0, 0, -1, 1, 0, 0, -1, 1, 4, 4, 1, 1, 0, 0, "", "", 0, 0, "", "", "", 0, 0, "", 0, 0, 0, 0, 0, 0, 8, 300, 400, 0, 0, 0, "", 0, 0, 1, 3, 0, 2, 2, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 300, -1, -1, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1, 0, "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, 0, 0, 0, 0, 1, 2, 0, 0, 0, 2;

[ \IpProfile ]

[ CpMediaRealm ]

FORMAT Index = MediaRealmName, IPv4IF, IPv6IF, RemoteIPv4IF, RemoteIPv6IF, PortRangeStart, MediaSessionLeg, PortRangeEnd, IsDefault, QoeProfile, BWProfile, TopologyLocation, UsedByRoutingServer;
CpMediaRealm 0 = "DefaultRealm", "DDEIP", "", "", "", 6000, 5953, 65529, 1, "", "", 0, 0;

[ \CpMediaRealm ]

[ SBCRoutingPolicy ]

FORMAT Index = Name, LCREnable, LCRAverageCallLength, LCRDefaultCost, LdapServerGroupName;
SBCRoutingPolicy 0 = "Default_SBCRoutingPolicy", 0, 1, 0, "";

[ \SBCRoutingPolicy ]

[ SRD ]

FORMAT Index = Name, BlockUnRegUsers, MaxNumOfRegUsers, EnableUnAuthenticatedRegistrations, SharingPolicy, UsedByRoutingServer, SBCOperationMode, SBCRoutingPolicyName, SBCDialPlanName, AdmissionProfile;
SRD 0 = "DefaultSRD", 0, -1, 1, 0, 0, 0, "Default_SBCRoutingPolicy", "", "";

[ \SRD ]

[ SIPInterface ]

FORMAT Index = InterfaceName, NetworkInterface, SCTPSecondaryNetworkInterface, ApplicationType, UDPPort, TCPPort, TLSPort, SCTPPort, AdditionalUDPPorts, AdditionalUDPPortsMode, SRDName, MessagePolicyName, TLSContext, TLSMutualAuthentication, TCPKeepaliveEnable, ClassificationFailureResponseType, PreClassificationManSet, EncapsulatingProtocol, MediaRealm, SBCDirectMedia, BlockUnRegUsers, MaxNumOfRegUsers, EnableUnAuthenticatedRegistrations, UsedByRoutingServer, TopologyLocation, PreParsingManSetName, AdmissionProfile, CallSetupRulesSetId;
SIPInterface 0 = "SIPInterface_0", "DDEIP", "", 0, 5060, 5060, 5061, 0, "", 0, "DefaultSRD", "", "default", -1, 0, 500, -1, 0, "", 0, -1, -1, -1, 0, 0, "", "", -1;

[ \SIPInterface ]

[ ProxySet ]

FORMAT Index = ProxyName, EnableProxyKeepAlive, ProxyKeepAliveTime, ProxyLoadBalancingMethod, IsProxyHotSwap, SRDName, ClassificationInput, TLSContextName, ProxyRedundancyMode, DNSResolveMethod, KeepAliveFailureResp, GWIPv4SIPInterfaceName, SBCIPv4SIPInterfaceName, GWIPv6SIPInterfaceName, SBCIPv6SIPInterfaceName, MinActiveServersLB, SuccessDetectionRetries, SuccessDetectionInterval, FailureDetectionRetransmissions, AcceptDHCPProxyList;
ProxySet 0 = "ProxySet_0", 1, 60, 0, 0, "DefaultSRD", 0, "", -1, -1, "", "SIPInterface_0", "", "", "", 1, 1, 10, -1, 0;

[ \ProxySet ]

[ IPGroup ]

FORMAT Index = Type, Name, ProxySetName, VoiceAIConnector, SIPGroupName, ContactUser, SipReRoutingMode, AlwaysUseRouteTable, SRDName, MediaRealm, InternalMediaRealm, ClassifyByProxySet, ProfileName, MaxNumOfRegUsers, InboundManSet, OutboundManSet, RegistrationMode, AuthenticationMode, MethodList, SBCServerAuthType, OAuthHTTPService, EnableSBCClientForking, SourceUriInput, DestUriInput, ContactName, UsernameAsClient, PasswordAsClient, UsernameAsServer, PasswordAsServer, UUIFormat, QOEProfile, BWProfile, AlwaysUseSourceAddr, MsgManUserDef1, MsgManUserDef2, SIPConnect, SBCPSAPMode, DTLSContext, CreatedByRoutingServer, UsedByRoutingServer, SBCOperationMode, SBCRouteUsingRequestURIPort, SBCKeepOriginalCallID, TopologyLocation, SBCDialPlanName, CallSetupRulesSetId, TeamsRegistrationMode, Tags, SBCUserStickiness, UserUDPPortAssignment, AdmissionProfile, ProxyKeepAliveUsingIPG, SBCAltRouteReasonsSetName, TeamsLocalMediaOptimization, TeamsLocalMOInitialBehavior, SIPSourceHostName, TeamsDirectRoutingMode, TeamsLocalMOSite, UserVoiceQualityReport, ValidateSourceIP;
IPGroup 0 = 0, "CoreNGN_IPG", "ProxySet_0", "", "CoreNGN", "", -1, 0, "DefaultSRD", "DefaultRealm", "DefaultRealm", 0, "", -1, -1, -1, 0, 0, "", -1, "", 0, -1, -1, "", "", "", "", "", 0, "", "", 0, "", "", 0, 0, "default", 0, 0, -1, 0, 0, 0, "", -1, 0, "", 0, 0, "", 0, "", 0, 0, "", 0, "", 0, 0;

[ \IPGroup ]

[ PREFIX ]

FORMAT Index = RouteName, DestinationPrefix, DestAddress, SourcePrefix, ProfileName, MeteringCodeName, DestPort, DestIPGroupName, TransportType, SrcTrunkGroupID, DestSIPInterfaceName, CostGroup, ForkingGroup, CallSetupRulesSetId, DestTags, SrcTags;
PREFIX 0 = "", "*", "{{ip_sbc}}", "*", "", "", 5060, "CoreNGN_IPG", 0, 1, "SIPInterface_0", "", -1, -1, "", "";

[ \PREFIX ]

[ TelProfile ]

FORMAT Index = ProfileName, TelPreference, CodersGroupName, IsFaxUsed, JitterBufMinDelay, JitterBufOptFactor, IPDiffServ, SigIPDiffServ, DtmfVolume, InputGain, VoiceVolume, EnableReversePolarity, EnableCurrentDisconnect, EnableDigitDelivery, EnableEC, MWIAnalog, MWIDisplay, FlashHookPeriod, EnableEarlyMedia, ProgressIndicator2IP, TimeForReorderTone, EnableDIDWink, IsTwoStageDial, DisconnectOnBusyTone, EnableVoiceMailDelay, DialPlanIndex, Enable911PSAP, SwapTelToIpPhoneNumbers, EnableAGC, ECNlpMode, DigitalCutThrough, EnableFXODoubleAnswer, CallPriorityMode, FXORingTimeout, JitterBufMaxDelay, IP2TelCutThroughCallBehavior, PlayBusyTone2Isdn, MWINotificationTimeout;
TelProfile 1 = "TelProfile_1", 1, "AudioCodersGroups_0", 3, 10, 10, 46, 40, -11, 0, 0, 0, 0, 0, 1, 0, 0, 700, 0, -1, 255, 0, 1, 1, 1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 300, 0, 0, 0;

[ \TelProfile ]

[ TrunkGroup ]

FORMAT Index = TrunkGroupNum, FirstTrunkId, FirstBChannel, LastBChannel, FirstPhoneNumber, ProfileName, LastTrunkId, Module;
TrunkGroup 0 = 1, 0, 1, 31, "{{cabecera}}", "TelProfile_1", 0, 2;

[ \TrunkGroup ]

[ PstnPrefix ]

FORMAT Index = RouteName, DestPrefix, TrunkGroupId, SourcePrefix, SourceAddress, ProfileName, SrcIPGroupName, DestHostPrefix, SrcHostPrefix, SrcSIPInterfaceName, TrunkId, CallSetupRulesSetId, DestType, DestTags, SrcTags;
PstnPrefix 0 = "", "*", 1, "*", "{{ip_sbc}}", "IP_Profile_1", "", "*", "*", "SIPInterface_0", 1, -1, 0, "", "";

[ \PstnPrefix ]

[ StaticRouteTable ]

FORMAT Index = DestinationIP, PrefixLength, DeviceName, GatewayIP, Metric, DestinationName;
StaticRouteTable 0 = "{{red_sbc}}", {{cidr_sbc}}, "", "{{gateway_dde}}", "", "";

[ \StaticRouteTable ]

[ ProxyIp ]

FORMAT Index = ProxySetId, ProxyIpIndex, IpAddress, TransportType, Priority, Weight;
ProxyIp 0 = "0", 0, "{{ip_sbc}}", 0, 0, 0;

[ \ProxyIp ]

[ TrunkGroupSettings ]

FORMAT Index = TrunkGroupId, ChannelSelectMode, RegistrationMode, GatewayName, ContactUser, ServingIPGroupName, MWIInterrogationType, TrunkGroupName, UsedByRoutingServer, DedicatedConnectionMode, AdminState;
TrunkGroupSettings 0 = 1, 1, 4, "", "", "CoreNGN_IPG", 255, "TG_set", 0, 0, 0;

[ \TrunkGroupSettings ]

[ GwRoutingPolicy ]

FORMAT Index = Name, LCREnable, LCRAverageCallLength, LCRDefaultCost, LdapServerGroupName;
GwRoutingPolicy 0 = "GwRoutingPolicy", 0, 1, 0, "";

[ \GwRoutingPolicy ]

[ ResourcePriorityNetworkDomains ]

FORMAT Index = Name, Ip2TelInterworking;
ResourcePriorityNetworkDomains 1 = "dsn", 1;
ResourcePriorityNetworkDomains 2 = "dod", 1;
ResourcePriorityNetworkDomains 3 = "drsn", 1;
ResourcePriorityNetworkDomains 5 = "uc", 1;
ResourcePriorityNetworkDomains 7 = "cuc", 1;

[ \ResourcePriorityNetworkDomains ]

[ HTTPDirectiveSets ]

FORMAT Index = SetName, Description;
HTTPDirectiveSets 0 = "HTTP Context Directives", "Rate limiting directives for the nginx process in http scope. Edit carefully.";

[ \HTTPDirectiveSets ]

[ AudioCoders ]

FORMAT Index = AudioCodersGroupId, AudioCodersIndex, Name, pTime, rate, PayloadType, Sce, CoderSpecific;
AudioCoders 0 = "AudioCodersGroups_0", 0, 1, 2, 90, -1, 0, "";
AudioCoders 1 = "AudioCodersGroups_0", 1, 2, 2, 90, -1, 0, "";
AudioCoders 2 = "AudioCodersGroups_0", 2, 3, 2, 19, -1, 0, "";

[ \AudioCoders ]

[ HTTPDirectives ]

FORMAT Index = SetName, RowIndex, Directive;
HTTPDirectives 0 = "HTTP Context Directives", 0, "limit_conn AcZone 100;";
HTTPDirectives 1 = "HTTP Context Directives", 1, "limit_rate 0;";

[ \HTTPDirectives ]
