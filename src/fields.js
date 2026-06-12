const REQUIRED_FIELDS = [
  "nombre_archivo",
  "cabecera",
  "vlan_dde",
  "ip_dde",
  "cidr_dde",
  "gateway_dde",
  "vlan_gestion",
  "ip_gestion",
  "cidr_gestion",
  "dns_teco",
  "gateway_gestion",
  "ip_sbc",
  "red_sbc",
  "cidr_sbc"
];

const NUMERIC_FIELDS = [
  "vlan_dde",
  "cidr_dde",
  "vlan_gestion",
  "cidr_gestion",
  "cidr_sbc"
];

const IP_FIELDS = [
  "ip_dde",
  "gateway_dde",
  "ip_gestion",
  "dns_teco",
  "gateway_gestion",
  "ip_sbc",
  "red_sbc"
];

module.exports = {
  REQUIRED_FIELDS,
  NUMERIC_FIELDS,
  IP_FIELDS
};
